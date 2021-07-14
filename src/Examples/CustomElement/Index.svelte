<script>
    import SvelteObjectExplorerWebComponent from "../../../dist/custom_element.js";
    import Example from "../Example.svelte";
    let value;
    let open;
    let fade = true;
    let tabPosition = "middle";
    let ratelimit = 100;
</script>

<svelte-object-explorer {ratelimit} />
<Example />
