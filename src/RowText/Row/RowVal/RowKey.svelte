<script>
    export let row;
</script>

{#if "key" in row && row.key !== ""}<span class="key">{row.key}</span>:{@html "&nbsp;"}{/if}
