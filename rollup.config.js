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
//const terser = () => {
//    name: "terser test override";
//};

const plugins = [
    rolluppluginiconifysvg({ logging: "some" }),
    svelte({ ...removeWhitespace, emitCss: false }),
    resolve({
        browser: true,
        dedupe: ["svelte"],
    }),
    terser(),
];

//the main custom element distributable as IIFE index.js
const dist_custom_element_iife = {
    input: "./src/Examples/CustomElement/main_iife.js",
    output: [{ file: pkg.main, sourcemap: true, format: "iife", name: "SvelteObjectExplorerCustomElementIIFE" }],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
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
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
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
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        move_styles_to_root_element("./public/VanillaAndIIFE/iife_copy.js"),
        terser(),
    ],
};

//custom element distributable as ES module index.mjs
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
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        move_styles_to_root_element("./" + pkg.module),
        terser(),
    ],
};

//custom element distributable as ES module value.mjs
const dist_value_custom_element_es = {
    input: "./src/Examples/ValueCustomElement/main_es.js",
    output: [
        {
            file: "dist/value.mjs",
            sourcemap: true,
            format: "es",
            name: "SvelteObjectExplorerValueCustomElementESModule",
        },
    ],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte(create_custom_element),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        move_styles_to_root_element("./dist/value.mjs"),
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

const expander_example1_custom_element_iife = {
    input: "./src/Examples/IIFE/Expander/Example1/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementIIFE/Expander/Example1/bundle.js" },
    plugins,
};

const expander_example2_custom_element_iife = {
    input: "./src/Examples/IIFE/Expander/Example2/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementIIFE/Expander/Example2/bundle.js" },
    plugins,
};

const rows_example_custom_element_iife = {
    input: "./src/Examples/IIFE/Rows/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementIIFE/Rows/bundle.js" },
    plugins,
};

const example_page_custom_element_es = {
    input: "./src/Examples/CustomElement/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementES/bundle.js" },
    plugins,
};

const expander_example1_custom_element_es = {
    input: "./src/Examples/CustomElement/Expander/Example1/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementES/Expander/Example1/bundle.js" },
    plugins,
};

const expander_example2_custom_element_es = {
    input: "./src/Examples/CustomElement/Expander/Example2/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementES/Expander/Example2/bundle.js" },
    plugins,
};

const rows_example_custom_element_es = {
    input: "./src/Examples/CustomElement/Rows/main.js",
    output: { format: "iife", name: "app", file: "public/CustomElementES/Rows/bundle.js" },
    plugins,
};

const example_page_svelte_component = {
    input: "./src/Examples/SvelteComponent/main.js",
    output: { format: "iife", name: "app", file: "public/SvelteComponent/bundle.js" },
    plugins,
};

const expander_example1_svelte_component = {
    input: "./src/Examples/SvelteComponent/Expander/Example1/main.js",
    output: { format: "iife", name: "app", file: "public/SvelteComponent/Expander/Example1/bundle.js" },
    plugins,
};

const expander_example2_svelte_component = {
    input: "./src/Examples/SvelteComponent/Expander/Example2/main.js",
    output: { format: "iife", name: "app", file: "public/SvelteComponent/Expander/Example2/bundle.js" },
    plugins,
};

const rows_example1_svelte_component = {
    input: "./src/Examples/SvelteComponent/Rows/main.js",
    output: { format: "iife", name: "app", file: "public/SvelteComponent/Rows/bundle.js" },
    plugins,
};

export default [
    dist_custom_element_iife,
    dist_custom_element_iife_copy1,
    dist_custom_element_iife_copy2,
    example_page_iife,
    expander_example1_custom_element_iife,
    expander_example2_custom_element_iife,
    rows_example_custom_element_iife,

    dist_custom_element_es,
    example_page_custom_element_es,
    expander_example1_custom_element_es,
    expander_example2_custom_element_es,
    rows_example_custom_element_es,

    example_page_svelte_component,
    expander_example1_svelte_component,
    expander_example2_svelte_component,
    rows_example1_svelte_component,

    dist_value_custom_element_es,
];
