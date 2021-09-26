<script>
    import RowHtml from "./RowHtml/Index.svelte";
    import Row from "./Row/Index.svelte";

    export let row;
    export let isExpanded = false;
</script>

{#if row && typeof row === "object"}{#if row.html}<RowHtml {row} {isExpanded} />{:else}<Row
            {row}
            {isExpanded}
        />{/if}{/if}
