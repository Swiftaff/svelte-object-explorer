//used by root rollup.config.js to create bundle of the UMD module for use in the UMD example index.html.
import SvelteObjectExplorer from "../../Index.svelte";
const svelteObjectExplorer = new SvelteObjectExplorer({ target: document.body });
export default svelteObjectExplorer;
