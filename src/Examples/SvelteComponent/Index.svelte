<script>
    import SvelteObjectExplorer from "../../Index.svelte";
    import Example from "../Example.svelte";
    let value;
    let open;
    let fade;
    let tabposition;
    let ratelimit;
    let rows;
    let settings;
    function sendprops(obj) {
        if ("value" in obj) value = obj.value;
        if ("open" in obj) open = obj.open;
        if ("fade" in obj) fade = obj.fade;
        if ("tabposition" in obj) tabposition = obj.tabposition;
        if ("ratelimit" in obj) ratelimit = obj.ratelimit;
        if ("rows" in obj) rows = obj.rows;
        if ("settings" in obj) settings = obj.settings;
    }
</script>

<SvelteObjectExplorer {value} {open} {fade} {tabposition} {ratelimit} {rows} {settings} />
<Example {sendprops} />
