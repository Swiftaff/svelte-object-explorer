<script>
    import SvelteObjectExplorerWebComponentESModule from "../../../../dist/index.mjs";

    import fixtures from "../../ExampleMultipleRows.js";

    let value;
    let settings;
    let params = new URL(document.location).searchParams;
    let test_num = params.get("test");

    $: if (fixtures && test_num && fixtures["test" + test_num]) {
        if (fixtures["test" + test_num].value) value = fixtures["test" + test_num].value;
        if (fixtures["test" + test_num].settings) settings = fixtures["test" + test_num].settings;
    }
</script>

<svelte-object-explorer {value} {settings} />
