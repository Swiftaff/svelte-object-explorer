import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";
import css from "rollup-plugin-css-only";
import rolluppluginiconifysvg from "rollup-plugin-iconify-svg";
import { terser } from "rollup-plugin-terser";

const removeWhitespace = {
    preprocess: {
        markup: ({ content, filename }) => {
            return {
                code: content.replace(/>[\s]{2,}</g, "><"),
            };
        },
    },
};
const plugins = [
    rolluppluginiconifysvg({ logging: "some" }),
    svelte({ ...removeWhitespace, emitCss: false }),
    resolve(),
    terser(),
    //css({ output: "bundle.css" }),
];

//the main custom element distributable as IIFE index.js
const dist_custom_element_iife = {
    input: "./src/Examples/CustomElement/main_iife.js",
    output: [
        { file: pkg.main, sourcemap: true, format: "iife", name: "SvelteObjectExplorerCustomElementIIFE" },
        {
            // a copy of iife for testing
            file: "public/CustomElementIIFE/iife_copy.js",
            format: "iife",
            name: "SvelteObjectExplorerCustomElementIIFE",
        },
        {
            // a copy of iife for testing
            file: "public/VanillaAndIIFE/iife_copy.js",
            format: "iife",
            name: "SvelteObjectExplorerCustomElementIIFE",
        },
    ],
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte({ ...removeWhitespace, compilerOptions: { customElement: true } }),
        resolve(),
        terser(),
    ],
};

//custom element distributable as ES module index.mjs
const dist_custom_element_es = {
    input: "./src/Examples/CustomElement/main_es.js",
    output: {
        file: "./dist/index.mjs",
        sourcemap: true,
        format: "es",
        name: "SvelteObjectExplorerCustomElementESModule",
    },
    plugins: [
        rolluppluginiconifysvg({ logging: "some" }),
        svelte({ ...removeWhitespace, compilerOptions: { customElement: true } }),
        resolve(),
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
    dist_custom_element_es,

    example_page_iife,
    example_page_svelte_component,
    example_page_custom_element_es,
];
