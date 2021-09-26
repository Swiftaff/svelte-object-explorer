<script>
    import RowHtmlExpanded from "./RowHtmlExpanded.svelte";
    export let row;
    export let isExpanded;
</script>

{#if isExpanded}
    <RowHtmlExpanded {row} />
{:else}
    {@html row.html}
{/if}
