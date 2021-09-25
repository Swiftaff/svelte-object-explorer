<script>
    export let value;
    let ref;
    $: if (ref) ref["svelte-explorer-value"] = value;
</script>

<svelte-explorer-expand bind:this={ref} />
