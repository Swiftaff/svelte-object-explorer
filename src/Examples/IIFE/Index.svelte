<script>
    import Example from "../Example.svelte";
    const sendprops = (obj) => (window.svelteobjectexplorer = obj);
</script>

<!--SvelteObjectExplorerWebComponentIIFE is added separately via index.html -->
<Example {sendprops} />
