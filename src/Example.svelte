<script>
  export let testObject;
  import SvelteObjectExplorer from "./Index.svelte";
</script>

<SvelteObjectExplorer myStore={testObject} />

<h1>Example Object</h1>
{JSON.stringify(testObject)}
