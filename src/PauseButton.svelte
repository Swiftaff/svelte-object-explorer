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

<style>
    button.pause {
        position: absolute;
        top: 3px;
        right: 3px;
    }
</style>
