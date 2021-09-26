<script>
    import RowValOptionalQuotes from "./RowValOptionalQuotes/Index.svelte";
    import RowKey from "./RowKey.svelte";
    import RowValClosed from "./RowValClosed.svelte";
    import RowIndent from "./RowIndent.svelte";
    export let row;
    export let isExpanded;
</script>

<RowIndent {row} /><RowKey {row} />{#if isExpanded}<RowValClosed {row} />{:else}<RowValOptionalQuotes {row} />{/if}
