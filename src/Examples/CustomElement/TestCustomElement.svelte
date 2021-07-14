<svelte:options tag="svelte-object-explorer" />

<script>
    export let mystore = "test";
</script>

<h1>Testy {JSON.stringify(mystore)}</h1>

<style>
    h1 {
        color: red;
    }
</style>
