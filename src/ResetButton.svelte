<script>
    export let reset;
</script>

<button class="reset" on:mouseup={reset}> Reset </button>

<style>
    .reset {
        position: absolute;
        top: 3px;
        right: 50px;
    }
</style>
