<script>
    import SvelteObjectExplorer from "../../Index.svelte";
    import Example from "../Example.svelte";
    let value;
    let open;
    let fade;
    let tabPosition;
    let ratelimit;
</script>

<SvelteObjectExplorer {value} {open} {fade} {tabPosition} {ratelimit} />
<Example bind:value bind:open bind:fade bind:tabPosition bind:ratelimit />
