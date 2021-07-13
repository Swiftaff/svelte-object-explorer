<svelte:options tag="svelte-object-explorer" />

<script>
    import { onMount } from "svelte";
    import TabButton from "./TabButton.svelte";
    import PauseButton from "./PauseButton.svelte";
    import CacheDisplay from "./CacheDisplay.svelte";
    import ChevronButtons from "./ChevronButtons.svelte";
    import RowText from "./RowText.svelte";
    import lib from "../lib.js";
    import transform_data from "../transform_data.js";

    let rateLimitDefault = 100;
    let stringifiedmy_storeCache = "";

    export let my_store;
    export let tabPosition = "top";
    export let open = null;
    export let fade = false;
    export let rateLimit = rateLimitDefault;
    export let initialToggleState = true;

    let isPaused = false;
    let hovering = false;
    let openIndexSetOnce = false;

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
        my_store: null,
    };
    let mainLoop;

    $: if (toggle) rowsToShow = showManuallySelected;
    $: if (rateLimit === null) rateLimit = rateLimitDefault;

    onMount(async () => {
        rowsToShow = showManuallySelected;
        if (!my_store) my_store = lib.domParser();
        mainLoop = timer();
    });

    function timer() {
        setInterval(() => {
            refreshDataAndCache();
        }, rateLimit);
    }

    function refreshDataAndCache() {
        //console.log("refreshDataAndCache", my_store);
        if (toggle) {
            const stringifiedmy_store = JSON.stringify(my_store);
            if (stringifiedmy_store !== stringifiedmy_storeCache) {
                cache.dataUpdated = new Date();
                cache.dataChanges = cache.dataChanges + 1;
                stringifiedmy_storeCache = stringifiedmy_store;
            }
            const time_since_last_check = cache.dataUpdated - cache.viewUpdated;
            if (time_since_last_check > rateLimit && !isPaused) {
                cache.my_store = JSON.parse(JSON.stringify(my_store));
                cache.viewChanges = cache.viewChanges + 1;
                cache.viewUpdated = new Date();
                cache.dataUpdated = cache.viewUpdated;
                cache.formatted = transform_data.formatDate(cache.viewUpdated);
                stringifiedmy_storeCache = JSON.stringify(cache.my_store);

                topLevelObjectArray = transform_data.transform_data(cache); //this should trigger a redraw
                //console.log("topLevelObjectArray", topLevelObjectArray);
                //open requested object
                let openIndexRef;
                if (!openIndexSetOnce) {
                    openIndexRef = transform_data.getOpenIndex(topLevelObjectArray, open);
                    openIndexSetOnce = true;
                    if (openIndexRef) rowExpand(openIndexRef);
                }
            }
        }
    }

    // UI functions

    function doToggle() {
        toggle = !toggle;
    }

    function rowContract(rowIndex) {
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
    }

    function pause() {
        isPaused = true;
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
            <CacheDisplay {cache} {rateLimit} {rateLimitDefault} />
            <table>
                {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
                    <tr class="treeVal" on:mouseout={() => (hoverRow = null)}>
                        <td class="treeVal">
                            <pre>
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
                              </pre>
                        </td>
                    </tr>
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
