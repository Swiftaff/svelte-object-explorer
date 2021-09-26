//used by example rollup.config.js to create bundle of the example app.
import SvelteValue from "./Index.svelte";
const svelteValue = new SvelteValue({ target: document.body });
export default svelteValue;
