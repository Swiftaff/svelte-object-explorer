<script>
    export let isPaused;
    export let pause;
    export let unpause;
</script>

{#if isPaused}
    <button on:mouseup={unpause}> un-Pause </button>
{:else}
    <button on:mouseup={pause}> Pause </button>
{/if}

<style>
    button {
        position: absolute;
        top: 3px;
        right: 3px;
    }
</style>
