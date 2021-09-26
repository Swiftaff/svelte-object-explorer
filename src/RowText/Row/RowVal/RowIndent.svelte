<script>
    export let row;
</script>

{#if row && typeof row === "object"}{" ".repeat(row.indent)}{/if}
