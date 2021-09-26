<script>
    export let row;
    export let isExpanded;
</script>

{#if row && typeof row === "object" && row.len}<span class={"len" + (isExpanded ? " grey" : "")}>({row.len})</span>{/if}

<style>
    .len {
        color: black;
        position: absolute;
        right: 70px;
        top: 0px;
    }
    .grey {
        color: #666;
    }
</style>
