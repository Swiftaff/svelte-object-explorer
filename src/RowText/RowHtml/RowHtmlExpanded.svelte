<script>
    export let row;
</script>

{#if row.expandable}
    {@html row.expandable}
{:else}
    {@html row.html}
{/if}
