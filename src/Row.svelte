<script>
    import ChevronButtons from "../src/ChevronButtons.svelte";
    import RowText from "../src/RowText/Index.svelte";

    export let row;
    export let rowsToShow;
    export let hoverRow;
    export let changeHoverRow;
    export let topLevelObject;
    export let rowContract;
    export let rowExpand;

    let shouldShowRow;
    let getClass = "";

    $: shouldShowRow =
        rowsToShow &&
        rowsToShow.length &&
        rowsToShow.includes(row.parentIndexRef) &&
        (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef))));

    $: getClass =
        (row && "indexRef" in row && hoverRow === row.indexRef) ||
        (row && "parentIndexRef" in row && row.parentIndexRef.startsWith(hoverRow))
            ? "row hoverRow"
            : "row";

    function doChangeHoverRow() {
        changeHoverRow(row.indexRef);
    }
    function logRow() {
        console.log(row.indexRef, row.val, row.level, topLevelObject.childRows, rowsToShow);
    }
</script>

{#if shouldShowRow}<div
        class={getClass}
        on:mouseover={doChangeHoverRow}
        on:focus={doChangeHoverRow}
        on:mousedown={logRow}
        on:blur={logRow}
    >
        <RowText {row} isExpanded={rowsToShow.includes(row.indexRef)} /><ChevronButtons
            {row}
            {rowsToShow}
            {rowContract}
            {rowExpand}
        />
    </div>{/if}

<style>
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
