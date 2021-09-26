<script>
    export let row;
</script>

{#if row && typeof row === "object" && "key" in row && row.key !== ""}<span class="key">{row.key}</span
    >:{@html "&nbsp;"}{/if}
