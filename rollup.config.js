import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";
import rolluppluginiconifysvg from "rollup-plugin-iconify-svg";
import {
    move_styles_to_root_element,
    removeWhitespace,
    create_custom_element,
} from "./rollup-plugin-custom-element.js";
import { terser } from "rollup-plugin-terser";

const plugins = [
    rolluppluginiconifysvg({ logging: "some" }),
    svelte({ ...removeWhitespace, emitCss: false }),
    resolve(),
    terser(),
];

//the main custom element distributable as IIFE index.js
const dist_custom_element_iife = {
    input: "./src/Examples/CustomElement/main_iife.js",
    output: [{ file: pkg.main, sourcemap: true, format: "iife", name: "SvelteObjectExplorerCustomElementIIFE" }],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve(),
        move_styles_to_root_element("./" + pkg.main),
        terser(),
    ],
};

const dist_custom_element_iife_copy1 = {
    input: "./src/Examples/CustomElement/main_iife.js",
    output: [
        {
            // a copy of iife for testing
            file: "./public/CustomElementIIFE/iife_copy.js",
            format: "iife",
            name: "SvelteObjectExplorerCustomElementIIFE",
        },
    ],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve(),
        move_styles_to_root_element("./public/CustomElementIIFE/iife_copy.js"),
        terser(),
    ],
};

const dist_custom_element_iife_copy2 = {
    input: "./src/Examples/CustomElement/main_iife.js",
    output: [
        {
            // a copy of iife for testing
            file: "./public/VanillaAndIIFE/iife_copy.js",
            format: "iife",
            name: "SvelteObjectExplorerCustomElementIIFE",
        },
    ],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve(),
        move_styles_to_root_element("./public/VanillaAndIIFE/iife_copy.js"),
        terser(),
    ],
};

//custom element distributable as ES module index.mjs
//v2 attempt using preprocessor
const dist_custom_element_es = {
    input: "./src/Examples/CustomElement/main_es.js",
    output: [
        {
            file: pkg.module,
            sourcemap: true,
            format: "es",
            name: "SvelteObjectExplorerCustomElementESModule",
        },
    ],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve(),
        move_styles_to_root_element("./" + pkg.module),
        terser(),
    ],
};

//svelte distributable does not need to be bundled and is accessed directly from package.json["svelte"]

//below are just bundles for the examples

const example_page_iife = {
    input: "./src/Examples/IIFE/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementIIFE/bundle.js" },
    plugins,
};

const example_page_svelte_component = {
    input: "./src/Examples/SvelteComponent/main.js",
    output: { format: "iife", name: "app", file: "public/SvelteComponent/bundle.js" },
    plugins,
};

const example_page_custom_element_es = {
    input: "./src/Examples/CustomElement/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementES/bundle.js" },
    plugins,
};

export default [
    dist_custom_element_iife,
    dist_custom_element_iife_copy1,
    dist_custom_element_iife_copy2,
    dist_custom_element_es,

    example_page_iife,
    example_page_svelte_component,
    example_page_custom_element_es,
];
