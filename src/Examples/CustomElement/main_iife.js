//used by root rollup.config.js to create custom_element index.js distributable
import SvelteObjectExplorer from "../../Index.svelte";
const svelteObjectExplorer = new SvelteObjectExplorer({ target: document.body });
export default svelteObjectExplorer;
