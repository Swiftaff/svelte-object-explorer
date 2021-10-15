<script>
    export let row;
</script>

{#if row}{#if typeof row === "object" && row.expandable}{@html row.expandable}{:else}{@html row.html}{/if}{/if}
