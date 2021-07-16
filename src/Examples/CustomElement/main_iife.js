//used by root rollup.config.js to create custom_element index.js distributable
import SvelteObjectExplorer from "./App.svelte";
const svelteObjectExplorer = new SvelteObjectExplorer({ target: document.body });
export default svelteObjectExplorer;
