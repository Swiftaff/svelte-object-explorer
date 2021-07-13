<svelte:options tag="svelte-object-explorer-pause-button" />

<script>
    export let isPaused;
    export let pause;
    export let unpause;
</script>

{#if isPaused}
    <button class="pause" on:mouseup={unpause}> un-Pause </button>
{:else}
    <button class="pause" on:mouseup={pause}> Pause </button>
{/if}
