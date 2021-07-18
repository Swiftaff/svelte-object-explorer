<script>
    import SvelteObjectExplorerWebComponentESModule from "../../../dist/index.mjs";
    import Example from "../Example.svelte";
    let value;
    let open;
    let fade;
    let tabposition;
    let ratelimit;
    function sendprops(obj) {
        if ("value" in obj) value = obj.value;
        if ("open" in obj) open = obj.open;
        if ("fade" in obj) fade = obj.fade;
        if ("tabposition" in obj) tabposition = obj.tabposition;
        if ("ratelimit" in obj) ratelimit = obj.ratelimit;
    }
</script>

<svelte-object-explorer {value} {open} {fade} {tabposition} {ratelimit} />
<Example {sendprops} />
