<script>
  export let myStore;
  let toggle = true;
  let debugStoreHovered = null;
  let testyArr = [];
  $: {
    testyArr = [];
    for (const key in myStore) {
      if (myStore.hasOwnProperty(key)) {
        testyArr.push({ key, val: myStore[key], type: getType(myStore[key]) });
      }
    }
    testyArr.sort(sort_byKey);
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

  function doToggle() {
    toggle = !toggle;
  }

  function getType(val) {
    return Array.isArray(val) ? "array" : typeof val;
  }

  function displayVal(val) {
    if (val === null) {
      return "null";
    } else if (getType(val) === "function") {
      return "fn()";
    } else if (getType(val) === "object") {
      return Object.entries(val).length ? "view Obj..." : "{ }";
    } else if (getType(val) === "array") {
      return val.length ? "view Arr..." : "[ ]";
    } //
    else if (getType(val) === "boolean") {
      return val ? "true" : "false";
    } else if (getType(val) === "string") {
      return val;
    } else if (getType(val) === "number") {
      return JSON.stringify(val);
    }
  }

  function click(key, val, type) {
    if (
      (Object.entries(val).length && type === "object") ||
      (val.length && type === "array")
    ) {
      if (debugStoreHovered === key) {
        debugStoreHovered = null;
      } else {
        debugStoreHovered = key;
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

  function code_format_null(parentArr, level, optionalIndex) {
    parentArr.push({
      output: indent_row(code_format_index(optionalIndex) + "null", level),
      type: "Null"
    });
  }

  function code_format_undefined(parentArr, level, optionalIndex) {
    parentArr.push({
      output: indent_row(code_format_index(optionalIndex) + "undefined", level),
      type: "Undefined"
    });
  }
  function code_format_boolean(parentArr, bool, level, optionalIndex) {
    parentArr.push({
      output: indent_row(
        code_format_index(optionalIndex) + (bool ? "true" : "false"),
        level
      ),
      type: "Boolean"
    });
  }

  function code_format_string(parentArr, str, level, optionalIndex) {
    parentArr.push({
      output: indent_row(
        code_format_index(optionalIndex) + "'" + str + "'",
        level
      ),
      type: "String"
    });
  }

  function code_format_number(parentArr, num, level, optionalIndex) {
    parentArr.push({
      output: indent_row(code_format_index(optionalIndex) + num, level),
      type: "Number"
    });
  }

  function code_format_symbol(parentArr, sym, level, optionalIndex) {
    parentArr.push({
      output: indent_row(
        code_format_index(optionalIndex) + "'" + sym.toString() + "'",
        level
      ),
      type: "Symbol"
    });
  }

  function code_format_function(parentArr, fn, level, optionalIndex) {
    parentArr.push({
      output: indent_row(
        code_format_index(optionalIndex) + "'" + fn.name + "'",
        level
      ),
      type: "Function"
    });
  }

  function code_format_array(
    parentArr,
    arr,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    if (optionalNewLine) {
      parentArr.push({
        output: indent_row(code_format_index(optionalIndex), level)
      });
    }
    /*
      parentArr.push({
        output: indent_row(
          "[  Array (" + arr.length + ")",
          level + (optionalIndex ? 2 : 1)
        )
      });
      arr.map((value, index) =>
        formatByType(parentArr, value, level + (optionalIndex ? 3 : 2), index)
      );
      parentArr.push({
        output: indent_row("]", level + (optionalIndex ? 2 : 1))
      });
    } else {*/
    parentArr.push({
      output: indent_row(
        (optionalNewLine ? "" : code_format_index(optionalIndex)) +
          "[  Array (" +
          arr.length +
          ")",
        level + (optionalIndex ? 1 : 0)
      )
    });
    arr.map((value, index) =>
      formatByType(
        parentArr,
        value,
        level + (optionalIndex ? 2 : 1),
        index,
        true
      )
    );
    parentArr.push({
      output: indent_row("]", level + (optionalIndex ? 1 : 0))
    });
    //}
  }

  function code_format_object(
    parentArr,
    obj,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    let object = Object.entries(obj);
    if (optionalNewLine) {
      parentArr.push({
        output: indent_row(code_format_index(optionalIndex), level)
      });
    }
    parentArr.push({
      output: indent_row(
        (optionalNewLine ? "" : code_format_index(optionalIndex)) +
          "{  Object (" +
          object.length +
          ")",
        level + (optionalIndex || optionalNewLine ? 1 : 0)
      )
    });
    object.forEach(([key, value], index) => {
      formatByType(
        parentArr,
        value,
        level + (optionalIndex || optionalNewLine ? 2 : 1),
        key,
        true
      );
    });

    parentArr.push({
      output: indent_row(
        "}",
        level + (optionalIndex || optionalNewLine ? 1 : 0)
      )
    });
  }

  function code_format_unknown(parentArr, level, optionalIndex) {
    parentArr.push({
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
    return " ".repeat(level * 3) + row;
  }

  function formatByType(
    parentArr,
    value,
    level,
    optionalIndex,
    optionalNewLine
  ) {
    if (value === null) code_format_null(parentArr, level, optionalIndex);
    else if (typeof value === "undefined")
      code_format_undefined(parentArr, level, optionalIndex);
    else if (typeof value === "boolean")
      code_format_boolean(parentArr, value, level, optionalIndex);
    else if (typeof value === "string")
      code_format_string(parentArr, value, level, optionalIndex);
    else if (typeof value === "number")
      code_format_number(parentArr, value, level, optionalIndex);
    else if (typeof value === "symbol")
      code_format_symbol(parentArr, value, level, optionalIndex);
    else if (typeof value === "function")
      code_format_function(parentArr, value, level, optionalIndex);
    else if (Array.isArray(value))
      code_format_array(
        parentArr,
        value,
        level,
        optionalIndex,
        optionalNewLine
      );
    else if (typeof value === "object")
      code_format_object(
        parentArr,
        value,
        level,
        optionalIndex,
        optionalNewLine
      );
    else code_format_unknown(parentArr, level, optionalIndex);
  }

  function valueFormatter(object) {
    let parentArr = []; //[{ output: '   test:"test"', type: "string" }];
    //let test = { test: ["test", { test: 1, test2: 2 }], test: 3, test2: 4 };
    /*let test = {
      test0: { test5: 1234 },
      test: "test",
      test2: 123,
      test3: [123],
      test4: { test5: 1234 },
      test5: 2,
      test6: "3",
      test7: [4, 5, 6]
    };*/
    formatByType(parentArr, object, 0);

    let str = "";
    parentArr.map(
      row =>
        (str += row.output + (row.type ? " (" + row.type + ")" : "") + "\n")
    );
    return str;
  }
</script>

<style>
  .tree {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 500px;
    height: 100%;
    background-color: #aaa;
    z-index: 10000000;
    overflow: auto;
    font-size: small;

    margin: 0;
    font-family: "Roboto";
    font-size: 14px;
    line-height: 1.3em;
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

  .toggle {
    position: absolute;
    bottom: 25px;
    width: 70px;
    height: 20px;
    text-align: center;
    transform: rotate(-90deg);
    background-color: #aaa;
    z-index: 10000000;

    margin: 0;
    font-family: "Roboto";
    font-size: 14px;
    line-height: 1.3em;
  }

  .toggleShow {
    right: 475px;
  }

  .toggleHide {
    right: -25px;
  }

  .accordion {
    background-color: #666 !important;
    color: white;
  }

  pre {
    margin: 0px;
  }
</style>

<div
  class={toggle ? 'toggle toggleShow' : 'toggle toggleHide'}
  on:click={doToggle}>
  {#if toggle}
    Hide
    <i class="fas fa-chevron-down" />
  {:else}
    Show
    <i class="fas fa-chevron-up" />
  {/if}
</div>
{#if toggle}
  <div class="tree">
    <table>
      <colgroup>
        <col style="width:35%" />
        <col style="width:10%" />
        <col style="width:55%" />
      </colgroup>
      {#each testyArr as testy}
        <tr
          class={displayClass(testy)}
          on:click={() => click(testy.key, testy.val, testy.type)}>
          <td>
            {#if displayClass(testy)}
              {#if debugStoreHovered === testy.key}
                <i class="fas fa-chevron-down" />
              {:else}
                <i class="fas fa-chevron-right" />
              {/if}
            {/if}
            {displayVal(testy.val)}
          </td>
          <td>{testy.type}</td>
          <td>{testy.key}</td>

        </tr>
        {#if debugStoreHovered === testy.key}
          <tr>
            <!-- only used to keep the odd even shading consistent when opening/closing accordion-->
            <td colspan="3" class="treeVal" />
          </tr>
          <tr class="treeVal">
            <td colspan="3" class="treeVal">
              <pre>{valueFormatter(testy.val)}</pre>
            </td>
          </tr>
        {/if}
      {/each}
    </table>
  </div>
{/if}
