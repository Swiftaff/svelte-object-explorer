<script>
    import RowVal from "./RowVal/Index.svelte";
    import RowLen from "./RowLen.svelte";
    import RowType from "./RowType.svelte";
    export let row;
    export let isExpanded;
</script>

<span><RowVal {row} {isExpanded} /><RowType {row} /><RowLen {row} {isExpanded} /></span>
