//used by example rollup.config.js to create bundle of the example app using the Svelte Component directly
import SvelteRows from "./Index.svelte";
const svelteRows = new SvelteRows({ target: document.body });
export default svelteRows;
