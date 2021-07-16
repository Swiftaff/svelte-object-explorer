//used by example rollup.config.js to create bundle of the example app using the custom_element distributable
import CustomElement from "./Index.svelte";
const customElement = new CustomElement({ target: document.body });
export default customElement;
