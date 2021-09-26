<script>
    import RowHtmlExpanded from "./RowHtmlExpanded.svelte";
    export let row;
    export let isExpanded;
</script>

{#if isExpanded}
    <RowHtmlExpanded {row} />
{:else if row && typeof row === "object"}{@html row.html}{/if}
