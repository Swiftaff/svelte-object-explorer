//used by example rollup.config.js to create bundle of the example app.
import SvelteObjectExplorer from "./Index.svelte";
const svelteObjectExplorer = new SvelteObjectExplorer({ target: document.body });
export default svelteObjectExplorer;
