<script>
    import { onMount } from "svelte";
    import TabButton from "../src/TabButton.svelte";
    import WidthAdjust from "../src/WidthAdjust.svelte";
    import ResetButton from "../src/ResetButton.svelte";
    import PauseButton from "../src/PauseButton.svelte";
    import CacheDisplay from "../src/CacheDisplay.svelte";
    import ChevronButtons from "../src/ChevronButtons.svelte";
    import RowText from "../src/RowText.svelte";
    import lib from "../src/lib.js";
    import transform_data from "../src/transform_data.js";

    let ratelimitDefault = 100;
    let stringifiedValueCache = "";
    let width = 500;
    let is_adjusting_width = false;
    let local_storage_key = "svelte-object-explorer";

    export let value;
    export let tabposition = "top";
    export let open = null;
    export let fade = false;
    export let ratelimit = ratelimitDefault;
    export let initialtogglestate = true;
    export let plugins = {};

    let isPaused = false;
    let hovering = false;
    let openIndexSetOnce = false;

    let showManuallySelected = ["0", "0.0"];
    let rowsToShow = [];
    let hoverRow = "none";
    let toggle = initialtogglestate;
    let topLevelObjectArray = [];
    let cache = {
        dataChanges: 0,
        viewChanges: 0,
        dataUpdated: new Date(),
        viewUpdated: new Date(),
        formatted: "",
        value: null,
    };
    let mainLoop;

    $: if (toggle) rowsToShow = showManuallySelected;
    $: if (ratelimit === null) ratelimit = ratelimitDefault;

    onMount(async () => {
        rowsToShow = showManuallySelected;
        mainLoop = timer();
        get_or_init_settings();
    });

    function get_or_init_settings() {
        let got_local_storage = localStorage.getItem(local_storage_key);
        if (got_local_storage) {
            let settings = JSON.parse(got_local_storage);
            if (settings) {
                if ("width" in settings) width = settings.width;
            }
        } else save_settings();
    }

    function save_settings() {
        let settings = { width };
        localStorage.setItem(local_storage_key, JSON.stringify(settings));
    }

    function timer() {
        setInterval(() => {
            //console.log(value);
            refreshDataAndCache();
        }, ratelimit);
    }

    function refreshDataAndCache() {
        if (toggle) {
            if (window && window.svelteobjectexplorer) {
                const obj = window.svelteobjectexplorer;
                if ("value" in obj) value = obj.value;
                if ("open" in obj) open = obj.open;
                if ("fade" in obj) fade = obj.fade;
                if ("tabposition" in obj) tabposition = obj.tabposition;
                if ("ratelimit" in obj) ratelimit = obj.ratelimit;
                if ("plugins" in obj) plugins = obj.plugins;
            }
            let newPlugins = plugins;
            let newValue = { value: value || lib.domParser(document.body, newPlugins), plugins: newPlugins };
            const stringifiedValue = JSON.stringify(newValue);
            if (stringifiedValue !== stringifiedValueCache) {
                cache.dataUpdated = new Date();
                cache.dataChanges = cache.dataChanges + 1;
                stringifiedValueCache = stringifiedValue;
            }
            const time_since_last_check = cache.dataUpdated - cache.viewUpdated;
            let expanded_from_tags = [];
            if (time_since_last_check > ratelimit && !isPaused) {
                cache.value = newValue.value;
                cache.plugins = newValue.plugins;
                cache.viewChanges = cache.viewChanges + 1;
                cache.viewUpdated = new Date();
                cache.dataUpdated = cache.viewUpdated;
                cache.formatted = transform_data.formatDate(cache.viewUpdated);
                stringifiedValueCache = JSON.stringify({ value: cache.value, plugins: newPlugins });

                const { rows, expanded } = transform_data.transform_data(cache);
                if (expanded && Array.isArray(expanded)) expanded_from_tags = expanded;
                topLevelObjectArray = rows; //this should trigger a redraw
            }
            //open requested object
            if (!openIndexSetOnce) {
                let openIndexRef = transform_data.getOpenIndex(topLevelObjectArray, open);
                if (openIndexRef) {
                    rowExpand(openIndexRef);
                    if (showManuallySelected.includes(openIndexRef)) openIndexSetOnce = true;
                }
                if (expanded_from_tags.length) {
                    expanded_from_tags.forEach(rowExpand);
                    openIndexSetOnce = true;
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
    function reset() {
        cache.viewChanges = 1;
        cache.dataChanges = 1;
    }
</script>

<div class="svelte-object-explorer-wrapper">
    <TabButton {toggle} {tabposition} {fade} {hovering} {doToggle} {width} {is_adjusting_width} />
    <WidthAdjust bind:width bind:is_adjusting_width {save_settings} />
    {#if toggle}
        <div
            id="svelteObjectExplorer"
            class={"tree" + (fade ? (hovering ? " noFade" : " fade") : " noFade")}
            style={"width: " +
                width +
                "px;" +
                (toggle ? "" : "right: -" + width + "px;" + (is_adjusting_width ? "" : " transition: 0.2s;"))}
            on:mouseover={() => (hovering = true)}
            on:mouseleave={() => (hovering = false)}
        >
            <ResetButton {reset} />
            <PauseButton {isPaused} {pause} {unpause} />
            <CacheDisplay {cache} {ratelimit} {ratelimitDefault} />
            <table style={"width: " + (width - 20) + "px; table-layout: fixed;"}>
                {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
                    <tr
                        class="treeVal"
                        style={"max-width: " + (width - 20) + "px;"}
                        on:mouseout={() => (hoverRow = null)}
                    >
                        <td class="treeVal" style={"max-width: " + (width - 20) + "px;"}>
                            <pre>
                                  {#each topLevelObject.childRows as row}
                                    {#if (
                                      rowsToShow.includes(row.parentIndexRef) &&
                                      (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef))))
                                    )}
                                      <div
                                      class={hoverRow === row.indexRef || row.parentIndexRef.startsWith(hoverRow) ? 'row hoverRow' : 'row'}
                                      on:mouseover={() => (hoverRow = row.indexRef)}
                                      on:mousedown={() => console.log(row.indexRef, row.val, row.level, topLevelObject.childRows, rowsToShow)}>
                                      <RowText {row} isExpanded={rowsToShow.includes(row.indexRef)} />
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
        z-index: 1000000000 !important;
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
        position: fixed;
        right: 0px;
        top: 0px;
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

    .tree tr:nth-child(odd) {
        background-color: #ccc;
    }

    .treeVal {
        min-height: 10px;
        overflow-wrap: break-word;
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
    }

    .row:nth-child(even) {
        background-color: #aaa;
    }

    .hoverRow {
        background-color: #68f !important;
    }
</style>
