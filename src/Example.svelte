<script>
  export let testObject;
  import SvelteObjectExplorer from "./Index.svelte";
</script>

<SvelteObjectExplorer myStore={testObject} />

<h1>Example Test Objects</h1>
<p>small: {JSON.stringify(testObject.mediumTestObject)}</p>

<p>medium: {JSON.stringify(testObject.mediumTestObject)}</p>

<p>large: {JSON.stringify(testObject.largeTestObject)}</p>
