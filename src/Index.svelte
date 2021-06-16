<script>
    import { onMount } from "svelte";
    import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";
    import FaRegCheckSquare from "svelte-icons/fa/FaRegCheckSquare.svelte";
    import FaRegSquare from "svelte-icons/fa/FaRegSquare.svelte";
    import FaClipboard from "svelte-icons/fa/FaClipboard.svelte";
    import FaClipboardCheck from "svelte-icons/fa/FaClipboardCheck.svelte";
    import lib from "../src/lib.js";
    import transform_data from "../src/transform_data.js";

    export let myStore;
    export let tabPosition = "top";
    export let open = null;
    export let fade = false;
    export let rateLimit = 100;
    export let initialToggleState = true;

    let isPaused = false;
    let hovering = false;
    let showAll = false;
    let openIndex = null;
    let openIndexSetOnce = false;

    let showAllArr = []; //populated later with all row references
    let showManuallySelected = ["0", "0.0"];
    let rowsToShow = [];
    let showClipboardText = false;
    let clipboardCode = "";
    let hoverRow = "none";
    let toggle = initialToggleState;
    let topLevelObjectArray = [];
    let openedObjectArray = [];
    let cache = {
        dataChanges: 0,
        viewChanges: 0,
        dataUpdated: new Date(),
        viewUpdated: new Date(),
        formatted: "",
        myStore: null,
    };
    let mainLoop;

    $: if (toggle) rowsToShow = showAll ? showAllArr : showManuallySelected;

    onMount(async () => {
        //console.log(isPaused);
        rowsToShow = showAll ? showAllArr : showManuallySelected;
        myStore = lib.domParser();
        mainLoop = timer();
    });

    function timer() {
        setInterval(() => {
            refreshDataAndCache();
        }, rateLimit);
    }

    function refreshDataAndCache() {
        if (toggle) {
            if (JSON.stringify(myStore) !== JSON.stringify(cache.myStore)) {
                cache.dataUpdated = new Date();
                cache.dataChanges = cache.dataChanges + 1;
            }
            if (cache.dataUpdated - cache.viewUpdated > rateLimit && !isPaused) {
                cache.myStore = JSON.parse(JSON.stringify(myStore));
                cache.viewChanges = cache.viewChanges + 1;
                cache.viewUpdated = new Date();
                cache.formatted = formatDate(cache.viewUpdated);

                topLevelObjectArray = transform_data.transform_data(cache); //this should trigger a redraw
                if (!openIndexSetOnce)
                    openIndex = transform_data.getOpenIndex(topLevelObjectArray, open, openIndexSetOnce);
                showAllArr = transform_data.getAllIndexes(topLevelObjectArray, openIndex);
            }
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
    }

    // UI functions

    function toggleShowAll() {
        showAll = !showAll;
    }
    function doToggle() {
        toggle = !toggle;
    }

    function rowContract(rowIndex) {
        showAll = false;
        showManuallySelected = showManuallySelected.filter((row) => !row.startsWith(rowIndex));
    }

    function rowExpand(rowIndex) {
        showManuallySelected = showManuallySelected.filter((row) => row !== rowIndex);
        showManuallySelected.push(rowIndex);
    }

    function copyToClipboard(txt) {
        let clipboardEl = document.getElementById("hiddenClipboard");
        clipboardEl.value = txt ? JSON.stringify(txt) : JSON.stringify(myStore);
        clipboardEl.select();
        document.execCommand("copy");
        showClipboardText = true;
        setTimeout(() => {
            showClipboardText = false;
        }, 2000);
    }

    function click(index, val, type) {
        //console.log("click", index, val, type, openIndex);
        if ((Object.entries(val).length && type === "object") || (val.length && type === "array")) {
            if (openIndex === index) {
                openIndex = null;
            } else {
                openIndex = index;
            }
        }
    }
</script>

<div class="svelte-objet-explorer-wrapper">
    <div
        class={(toggle ? "toggle toggleShow" : "toggle toggleHide") +
            " toggle" +
            tabPosition +
            (fade ? (hovering ? " noFade" : " fade") : " noFade")}
        on:mousedown={doToggle}
    >
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
    {#if toggle}
        <div
            id="svelteObjectExplorer"
            class={"tree" + (toggle ? "" : " tree-hide") + (fade ? (hovering ? " noFade" : " fade") : " noFade")}
            on:mouseover={() => (hovering = true)}
            on:mouseleave={() => (hovering = false)}
        >
            {#if isPaused}
                <button
                    on:mouseup={() => {
                        isPaused = false;
                        console.log(isPaused);
                    }}
                >
                    un-Pause
                </button>
            {:else}
                <button
                    on:mouseup={() => {
                        isPaused = true;
                        console.log(isPaused);
                    }}
                >
                    Pause
                </button>
            {/if}
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
                        class={testy.class + (openIndex === i ? " open" : "")}
                        on:mousedown={() => click(i, testy.val, testy.type)}
                    >
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
                                          on:mouseover={() => (hoverRow = row.indexRef)}
                                          on:mousedown={() => console.log(row.indexRef, testy.childRows, rowsToShow)}>
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
    {/if}
</div>

<style>
    .svelte-objet-explorer-wrapper {
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
        display: block;
        white-space: pre;
        height: 1.5em;
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
        right: 70px;
        top: 0px;
    }

    .type {
        color: green;
        position: absolute;
        top: 0px;
        right: 5px;
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

    .tree button {
        position: absolute;
        top: 3px;
        right: 3px;
    }
</style>
