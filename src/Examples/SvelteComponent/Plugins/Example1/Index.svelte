<script>
    import SvelteObjectExplorer from "../../../../Index.svelte";
    import fixtures from "./fixtures.js";

    let value;
    let plugins;
    let params = new URL(document.location).searchParams;
    let test_num = params.get("test");

    $: if (fixtures && test_num && fixtures["test" + test_num]) {
        if (fixtures["test" + test_num].value) value = fixtures["test" + test_num].value;
        if (fixtures["test" + test_num].plugins) plugins = fixtures["test" + test_num].plugins;
    }
</script>

<SvelteObjectExplorer {value} {plugins} />
