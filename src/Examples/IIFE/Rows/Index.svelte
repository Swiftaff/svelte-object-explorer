<script>
    // SvelteObjectExplorerWebComponentIIFE is added separately via index.html

    import fixtures from "../../ExampleMultipleRows.js";

    let value;
    let settings;
    let rows;
    let params = new URL(document.location).searchParams;
    let test_settings_num = params.get("test_settings");
    let test_props_num = params.get("test_props");

    $: if (fixtures) {
        const this_settings_test = fixtures["test" + test_settings_num];
        const this_props_test = fixtures["test" + test_props_num];
        if (test_settings_num && this_settings_test && this_settings_test.settings) {
            settings = { ...this_settings_test.settings, value: this_settings_test.value };
        }
        if (test_props_num && this_props_test) {
            if (this_props_test.value) value = this_props_test.value;
            if (this_props_test.settings && this_props_test.settings.rows) rows = this_props_test.settings.rows;
        }
        window.svelteobjectexplorer = { value, rows, settings };
    }
</script>
