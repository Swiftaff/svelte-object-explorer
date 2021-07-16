<script>
    import SvelteObjectExplorerWebComponentESModule from "../../../dist/index.mjs";
    import Example from "../Example.svelte";
    let value;
    let open;
    let fade;
    let tabPosition;
    let ratelimit;
    function sendprops(obj) {
        if ("value" in obj) value = obj.value;
        if ("open" in obj) open = obj.open;
        if ("fade" in obj) fade = obj.fade;
        if ("tabPosition" in obj) tabPosition = obj.tabPosition;
        if ("ratelimit" in obj) ratelimit = obj.ratelimit;
    }
</script>

<svelte-object-explorer {value} {open} {fade} {tabPosition} {ratelimit} />
<Example {sendprops} />
