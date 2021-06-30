<script>
    import { onMount } from "svelte";
    import TabButton from "../src/TabButton.svelte";
    import PauseButton from "../src/PauseButton.svelte";
    import CacheDisplay from "../src/CacheDisplay.svelte";
    import TopLevelObjectRow from "../src/TopLevelObjectRow.svelte";
    import ChevronButtons from "../src/ChevronButtons.svelte";
    import RowText from "../src/RowText.svelte";
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
    let openIndex = 0; // opens the relevant row if an object or array. 0 = 1st row
    let openIndexSetOnce = false;

    let showAllArr = []; //populated later with all row references
    let showManuallySelected = ["0", "0.0"];
    let rowsToShow = [];
    let hoverRow = "none";
    let toggle = initialToggleState;
    let topLevelObjectArray = [];
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
        if (!myStore) myStore = lib.domParser();
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
                cache.myStore = myStore; //JSON.parse(JSON.stringify(myStore)); //note: strips out undefined keys
                cache.viewChanges = cache.viewChanges + 1;
                cache.viewUpdated = new Date();
                cache.formatted = formatDate(cache.viewUpdated);

                topLevelObjectArray = transform_data.transform_data(cache); //this should trigger a redraw
                //if (!openIndexSetOnce)
                //    openIndex = transform_data.getOpenIndex(topLevelObjectArray, open, openIndexSetOnce);
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

    function click(index, val, type) {
        console.log("click", index, val, type, openIndex);
        if ((Object.entries(val).length && type === "object") || (val.length && type === "array")) {
            if (openIndex === index) {
                openIndex = null;
            } else {
                openIndex = index;
            }
        }
    }

    function unpause() {
        isPaused = false;
        console.log(isPaused);
    }

    function pause() {
        isPaused = true;
        console.log(isPaused);
    }
</script>

<div class="svelte-object-explorer-wrapper">
    <TabButton {toggle} {tabPosition} {fade} {hovering} {doToggle} />
    {#if toggle}
        <div
            id="svelteObjectExplorer"
            class={"tree" + (toggle ? "" : " tree-hide") + (fade ? (hovering ? " noFade" : " fade") : " noFade")}
            on:mouseover={() => (hovering = true)}
            on:mouseleave={() => (hovering = false)}
        >
            <PauseButton {isPaused} {pause} {unpause} />
            <CacheDisplay {cache} />
            <table>
                {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
                    {#if openIndex === topLevelObject_index}
                        <tr class="treeVal" on:mouseout={() => (hoverRow = null)}>
                            <td class="treeVal">
                                <!---->
                                <pre>
                                  {#if openIndex === topLevelObject_index}
                                    {#each topLevelObject.childRows as row}
                                      {#if (
                                        rowsToShow.includes(row.parentIndexRef) &&
                                        (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef))))
                                      )}
                                        <div
                                          class={hoverRow === row.indexRef || row.parentIndexRef.startsWith(hoverRow) ? 'row hoverRow' : 'row'}
                                          on:mouseover={() => (hoverRow = row.indexRef)}
                                          on:mousedown={() => console.log(row.indexRef, topLevelObject.childRows, rowsToShow)}>
                                          <RowText {row} isExpanded={(row.expandable && rowsToShow.includes(row.indexRef))} />
                                          <ChevronButtons {row} {rowsToShow} {rowContract} {rowExpand} />
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
    .svelte-object-explorer-wrapper {
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

    pre {
        margin: 0px;
        white-space: normal;
        padding: 0px;
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

    .hoverRow {
        background-color: #68f !important;
    }
</style>
