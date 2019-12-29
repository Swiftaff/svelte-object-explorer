<script>
  import { onMount } from "svelte";
  import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
  import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
  import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";
  import FaRegCheckSquare from "svelte-icons/fa/FaRegCheckSquare.svelte";
  import FaRegSquare from "svelte-icons/fa/FaRegSquare.svelte";
  import FaClipboard from "svelte-icons/fa/FaClipboard.svelte";
  import FaClipboardCheck from "svelte-icons/fa/FaClipboardCheck.svelte";

  export let myStore;
  export let tabPosition = "top";
  export let open = null;
  export let fade = false;
  export let rateLimit = 100;

  let hovering = false;
  let showAll = false;
  let openIndex = null;
  let openIndexSetOnce = false;
  let indentSpaces = 2;
  let showAllArr = []; //populated later with all row references
  let showManuallySelected = ["0", "0.0"];
  let rowsToShow = [];
  let showClipboardText = false;
  let clipboardCode = "";
  let hoverRow = "none";
  let toggle = true;
  let topLevelObjectArray = [];
  let openedObjectArray = [];
  let cache = {
    dataChanges: 0,
    viewChanges: 0,
    dataUpdated: new Date(),
    viewUpdated: new Date(),
    formatted: "",
    myStore
  };

  $: rowsToShow = showAll ? showAllArr : showManuallySelected;

  onMount(async () => {
    rowsToShow = showAll ? showAllArr : showManuallySelected;
    //createArray();
    //console.log(JSON.stringify(cache.nyStore));
    //openIndex = getOpenIndex(cache.nyStore); //only get onMount, since you don't want to override users selection later
  });

  let mainLoop = timer();

  //------- functions

  function toggleShowAll() {
    showAll = !showAll;
  }
  function doToggle() {
    toggle = !toggle;
  }

  function rowContract(rowIndex) {
    showAll = false;
    showManuallySelected = showManuallySelected.filter(
      row => !row.startsWith(rowIndex)
    );
  }

  function rowExpand(rowIndex) {
    showManuallySelected = showManuallySelected.filter(row => row !== rowIndex);
    showManuallySelected.push(rowIndex);
  }

  function timer() {
    setInterval(() => {
      if (JSON.stringify(myStore) !== JSON.stringify(cache.myStore)) {
        cache.dataUpdated = new Date();
        cache.dataChanges = cache.dataChanges + 1;
      }
      if (cache.dataUpdated - cache.viewUpdated > rateLimit) {
        cache.myStore = myStore;
        cache.viewChanges = cache.viewChanges + 1;
        cache.viewUpdated = new Date();
        cache.formatted = formatDate(cache.viewUpdated);
        createArray();
      }
    }, rateLimit);
  }

  function formatDate(d) {
    return (
      d.toDateString() +
      " " +
      d.getUTCHours() +
      ":" +
      d.getUTCMinutes() +
      ":" +
      d.getUTCSeconds() +
      ":" +
      d.getUTCMilliseconds()
    );
  }

  function createArray() {
    let tempArr = [];
    for (const key in cache.myStore) {
      if (cache.myStore.hasOwnProperty(key)) {
        let tempItem = {
          key,
          val: cache.myStore[key],
          type: getType(cache.myStore[key])
        };
        tempItem.class = displayClass(tempItem);
        tempItem.valType = displayValType(tempItem.val);
        tempItem.childRows = valueFormatterToArr(tempItem.val);
        tempArr.push(tempItem);
      }
    }
    tempArr.sort(sort_byKey);
    tempArr = tempArr.map((item, index) => {
      return { ...item, index };
    });
    topLevelObjectArray = tempArr; //this should trigger a redraw
    if (!openIndexSetOnce) openIndex = getOpenIndex(topLevelObjectArray);
    showAllArr = getAllIndexes(tempArr, openIndex);
  }

  function getOpenIndex(arr) {
    let i = null;
    if (arr && arr.length) {
      arr.map((item, index) => {
        if (
          item.key === open &&
          (item.type === "object" || item.type == "array")
        )
          i = index;
        openIndexSetOnce = true;
      });
    }
    return i;
  }

  function getAllIndexes(arrayToMap, openIndex) {
    //update the showallarray with all rows from parentArr
    //console.log(arrayToMap, openIndex);
    let arr = [];
    if (openIndex && arrayToMap[openIndex] && arrayToMap[openIndex].childRows)
      arrayToMap[openIndex].childRows.map(row => {
        arr.push(row.index);
      });
    return arr;
  }

  function valueFormatterToArr(object) {
    //console.log("valueFormatterToArr");
    let parentArr = []; //[{ output: '   test:"test"', type: "string" }];
    formatByType("0.0", "0", 0, parentArr, object, 0); // <- make this assign to parentArr specifically instead of with JS magic

    return parentArr;
  }

  function copyToClipboard() {
    let clipboardEl = document.getElementById("hiddenClipboard");
    clipboardEl.value = clipboardCode;
    clipboardEl.select();
    document.execCommand("copy");
    showClipboardText = true;
    setTimeout(() => {
      showClipboardText = false;
    }, 2000);
  }

  function sort_byKey(a, b) {
    var nameA = a.key.toUpperCase(); // ignore upper and lowercase
    var nameB = b.key.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // else name are equal
    return 0;
  }

  function getType(val) {
    return Array.isArray(val) ? "array" : typeof val;
  }

  function displayValType(val) {
    if (val === null) {
      return "null";
    } else if (getType(val) === "function") {
      return "fn()";
    } else if (getType(val) === "object") {
      return Object.entries(val).length ? "view Obj..." : "{ }";
    } else if (getType(val) === "array") {
      return val.length ? "view Arr..." : "[ ]";
    } else if (getType(val) === "boolean") {
      return val ? "true" : "false";
    } else if (getType(val) === "string") {
      return val;
    } else if (getType(val) === "number") {
      return JSON.stringify(val);
    }
  }

  function click(index, val, type) {
    //console.log("click", index, val, type, openIndex);
    if (
      (Object.entries(val).length && type === "object") ||
      (val.length && type === "array")
    ) {
      if (openIndex === index) {
        openIndex = null;
      } else {
        openIndex = index;
      }
    }
  }

  function displayClass(testy) {
    let isObject = testy.val ? Object.entries(testy.val).length : false;
    let accordion = testy.type !== "string" ? "accordion" : "";
    return testy.val !== [] && testy.val !== null && isObject
      ? accordion + " tree_" + testy.type
      : "";
  }

  function code_format_null(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(code_format_index(optionalIndex) + "null", level),
      type: "Null"
    });
  }

  function code_format_undefined(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(code_format_index(optionalIndex) + "undefined", level),
      type: "Undefined"
    });
  }

  function code_format_boolean(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    bool,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        code_format_index(optionalIndex) + (bool ? "true" : "false"),
        level
      ),
      type: "Boolean"
    });
  }

  function code_format_string(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    str,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        code_format_index(optionalIndex) + "'" + str + "'",
        level + (optionalIndex ? 1 : 0)
      ),
      type: "String"
    });
  }

  function code_format_number(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    num,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(code_format_index(optionalIndex) + num, level),
      type: "Number"
    });
  }

  function code_format_symbol(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    sym,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        code_format_index(optionalIndex) + "'" + sym.toString() + "'",
        level
      ),
      type: "Symbol"
    });
  }

  function code_format_function(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    fn,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        code_format_index(optionalIndex) + "'" + fn.name + "'",
        level
      ),
      type: "Function"
    });
  }

  function code_format_array(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    arr,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        (optionalNewLine ? "" : code_format_index(optionalIndex)) +
          code_format_index(optionalIndex),
        level + (optionalIndex ? 1 : 0)
      ),
      type: "Array",
      len: arr.length,
      expandable: true
    });
    if (optionalNewLine) {
      parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row("[", level + (optionalIndex ? 2 : 1)),
        bracket: true
      });
    }
    arr.map((value, arrIndex) =>
      formatByType(
        indexRef + "." + arrIndex,
        indexRef,
        arrIndex,
        parentArr,
        value,
        level + (optionalIndex ? 2 : 1),
        arrIndex,
        true
      )
    );
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row("]", level + (optionalIndex ? 2 : 1)),
      bracket: true
    });
  }

  function code_format_object(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    obj,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    let object = Object.entries(obj);
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        (optionalNewLine ? "" : code_format_index(optionalIndex)) +
          code_format_index(optionalIndex),
        level + (optionalIndex || optionalNewLine ? 1 : 0)
      ),
      type: "Object",
      len: object.length,
      expandable: true
    });
    if (optionalNewLine) {
      parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(
          "{",
          level + (optionalIndex || optionalNewLine ? 1 : 0)
        ),
        bracket: true
      });
    }
    object.forEach(([key, value], objIndex) => {
      formatByType(
        indexRef + "." + objIndex,
        indexRef,
        objIndex,
        parentArr,
        value,
        level + (optionalIndex || optionalNewLine ? 2 : 1),
        key,
        true
      );
    });
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        "}",
        level + (optionalIndex || optionalNewLine ? 1 : 0)
      ),
      bracket: true
    });
  }

  function code_format_unknown(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    level,
    optionalIndex
  ) {
    parentArr.push({
      indexRef,
      parentIndexRef,
      index,
      output: indent_row(
        code_format_index(optionalIndex) + "!!unknown!!",
        level
      )
    });
  }

  function code_format_index(optionalIndex) {
    return typeof optionalIndex !== "undefined" ? optionalIndex + ": " : "";
  }

  function indent_row(row, level) {
    return " ".repeat(level * indentSpaces) + row;
  }

  //formatByType("0.0", "0", 0, parentArr, object, 0);
  function formatByType(
    //
    indexRef,
    parentIndexRef, //e.g. "1.1.2.3"
    index, // e.g. 4, if this item is 1.1.2.3.4
    //
    parentArr,
    value,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    //console.log("formatByType", value);
    if (value === null)
      code_format_null(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        level,
        optionalIndex
      );
    else if (typeof value === "undefined")
      code_format_undefined(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        level,
        optionalIndex
      );
    else if (typeof value === "boolean")
      code_format_boolean(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex
      );
    else if (typeof value === "string")
      code_format_string(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex
      );
    else if (typeof value === "number")
      code_format_number(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex
      );
    else if (typeof value === "symbol")
      code_format_symbol(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex
      );
    else if (typeof value === "function")
      code_format_function(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex
      );
    else if (Array.isArray(value))
      if (value.length > 100) {
        code_format_string(
          indexRef,
          parentIndexRef,
          index,
          parentArr,
          "Array is very long (" + value.length + ")",
          level,
          optionalIndex
        );
        for (let i = 0; i < value.length; i += 100) {
          let end = i + 100 > value.length - 1 ? value.length : i + 99;
          let tempArr = value.slice(i, end);
          code_format_array(
            indexRef + "." + i,
            parentIndexRef,
            index,
            parentArr,
            tempArr,
            level + 1,
            optionalIndex + " (" + i + " to " + end + ")",
            optionalNewLine
          );
        }
      } else {
        code_format_array(
          indexRef,
          parentIndexRef,
          index,
          parentArr,
          value,
          level,
          optionalIndex,
          optionalNewLine
        );
      }
    else if (typeof value === "object")
      code_format_object(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        value,
        level,
        optionalIndex,
        optionalNewLine
      );
    else
      code_format_unknown(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        level,
        optionalIndex
      );
  }

  function removeWhitespace(row) {
    let html = "<span>" + row.output + "</span>";
    if (row.type) html = html + '<span class="type">' + row.type + "</span>";
    if (row.len) html = html + '<span class="len">(' + row.len + ")</span>";
    return html;
  }
</script>

<style>
  .wrapper {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    padding: 0px;
    margin: 0px;
    z-index: 100000000000000000 !important;
    pointer-events: none;
    font-family: "Roboto", "Arial", sans-serif !important;
  }

  .fade {
    opacity: 0.3 !important;
  }

  .noFade {
    opacity: 1 !important;
  }

  .tree {
    pointer-events: all;
    transition: 0.2s;
    position: fixed;
    right: 0px;
    top: 0px;
    width: 500px;
    height: 100vh;
    background-color: #aaa;
    z-index: 10000000;
    overflow: auto;
    font-size: small;

    margin: 0;
    font-size: 14px;
    line-height: 1.3em;

    -webkit-box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
    -moz-box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
    box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
  }

  .tree-hide {
    right: -500px;
    transition: 0.2s;
  }

  .tree table {
    table-layout: fixed;
    width: 480px;
  }

  .tree tr:nth-child(odd) {
    background-color: #ccc;
  }

  .treeVal {
    min-height: 10px;
    overflow-wrap: break-word;
    max-width: 480px;
    overflow: auto;
    background-color: #666 !important;
    color: white;
  }

  .toggle:hover {
    pointer-events: all;
    opacity: 1;
  }

  .toggle {
    pointer-events: all;
    cursor: pointer;
    position: fixed;
    width: 70px;
    height: 20px;
    text-align: center;
    transform: rotate(-90deg);
    background-color: #aaa;
    z-index: 10000000;

    margin: 0;
    font-size: 14px;
    line-height: 1.3em;
  }

  .toggletop {
    top: 25px;
  }

  .togglemiddle {
    top: calc(50vh - 25px);
  }

  .togglebottom {
    bottom: 25px;
  }

  .toggleShow {
    pointer-events: all;
    transition: 0.2s;
    right: 475px;
  }

  .toggleHide {
    pointer-events: all;
    transition: 0.2s;
    right: -25px;
  }

  .accordion {
    background-color: #666 !important;
    color: white;
  }

  pre {
    margin: 0px;
    white-space: normal;
    padding: 0px;
  }

  .icon1 {
    width: 15px;
    height: 15px;
  }

  .smaller {
    width: 15px;
    height: 15px;
    display: inline-block;
    position: relative;
    top: 2px;
  }

  .smallest {
    width: 15px;
    height: 15px;
    display: inline-block;
    position: relative;
    top: 2px;
    color: green;
  }

  .link {
    cursor: pointer;
  }

  .link:hover {
    background-color: #888;
  }

  .row {
    background-color: #999;
    position: relative;
    padding-left: 15px;
    display: block ruby;
    white-space: pre;
  }

  .row:nth-child(even) {
    background-color: #aaa;
  }

  .dataArrow {
    position: absolute;
    left: 0px;
    cursor: pointer;
  }

  .dataArrow:hover {
    color: black;
  }

  .len {
    color: black;
    position: absolute;
    right: 50px;
    top: 0px;
  }

  .type {
    color: green;
    position: absolute;

    top: 0px;

    right: 0px;
  }

  .nopointer {
    cursor: pointer;
    user-select: none;
  }

  .hoverRow {
    background-color: #68f !important;
  }

  .toggleShowAll,
  .copyToClipbord {
    display: inline;
  }

  #hiddenClipboard {
    position: absolute;
    left: -9999px;
  }
</style>

<div class="wrapper">
  <div
    class={(toggle ? 'toggle toggleShow' : 'toggle toggleHide') + ' toggle' + tabPosition + (fade ? (hovering ? ' noFade' : ' fade') : ' noFade')}
    on:mousedown={doToggle}>
    {#if toggle}
      Hide
      <span class="smaller">
        <FaChevronDown />
      </span>
    {:else}
      Show
      <span class="smaller">
        <FaChevronUp />
      </span>
    {/if}
  </div>

  <div
    id="svelteObjectExplorer"
    class={'tree' + (toggle ? '' : ' tree-hide') + (fade ? (hovering ? ' noFade' : ' fade') : ' noFade')}
    on:mouseover={() => (hovering = true)}
    on:mouseleave={() => (hovering = false)}>
    Data Changes({cache.dataChanges}) View Changes({cache.viewChanges})
    <br />
    Last Updated({cache.formatted})
    <table>
      <colgroup>
        <col style="width:35%" />
        <col style="width:10%" />
        <col style="width:55%" />
      </colgroup>
      {#each topLevelObjectArray as testy, i}
        <tr
          class={testy.class + (openIndex === i ? ' open' : '')}
          on:mousedown={() => click(i, testy.val, testy.type)}>
          <td class="link">
            {#if testy.class}
              <span class="smaller">
                {#if openIndex === i}
                  <FaChevronDown />
                {:else}
                  <FaChevronRight />
                {/if}
              </span>
            {/if}
            {testy.valType}
          </td>
          <td>{testy.type}</td>
          <td>{testy.key}</td>
        </tr>
        {#if openIndex === i}
          <tr>
            <!-- only used to keep the odd even shading consistent when opening/closing accordion-->
            <td colspan="3" class="treeVal" />
          </tr>
          <tr class="treeVal" on:mouseout={() => (hoverRow = null)}>
            <td colspan="3" class="treeVal">
              <!---->
              <pre>
                <div
                  class="toggleShowAll nopointer"
                  on:mousedown={toggleShowAll}>
                  {#if showAll}
                    <span class="smaller">
                      <FaRegCheckSquare />
                    </span>
                  {:else}
                    <span class="smaller">
                      <FaRegSquare />
                    </span>
                  {/if}
                  Show all
                </div>
                <div
                  class="copyToClipbord nopointer"
                  on:mousedown={copyToClipboard}>
                  {#if showClipboardText}
                    <span class="smaller">
                      <FaClipboardCheck />
                    </span>
                    Copied to clipboard!
                  {:else}
                    <span class="smaller">
                      <FaClipboard />
                    </span>
                    Copy to clipboard
                  {/if}
                  <input id="hiddenClipboard" />
                </div>

                {#if openIndex === i}
                  {#each testy.childRows as row}
                    {#if rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && rowsToShow.includes(row.indexRef)))}
                      <div
                        class={hoverRow === row.indexRef || row.parentIndexRef.startsWith(hoverRow) ? 'row hoverRow' : 'row'}
                        on:mouseover={() => (hoverRow = row.indexRef)}>
                        <span>
                          {row.output}
                          {#if row.type}
                            <span class="type">{row.type}</span>
                          {/if}
                          {#if row.len}
                            <span class="len">({row.len})</span>
                          {/if}
                        </span>
                        {#if row.expandable}
                          {#if rowsToShow.includes(row.indexRef)}
                            <span
                              class="smallest dataArrow"
                              on:mousedown={() => rowContract(row.indexRef)}>
                              <FaChevronDown />
                            </span>
                          {:else}
                            <span
                              class="smallest dataArrow"
                              on:mousedown={() => rowExpand(row.indexRef)}>
                              <FaChevronRight />
                            </span>
                          {/if}
                        {/if}
                      </div>
                    {/if}
                  {/each}
                {/if}
              </pre>
            </td>
          </tr>
        {/if}
      {/each}
    </table>
  </div>
</div>
