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
    rolluppluginiconifysvg(),
    svelte(removeWhitespace),
    resolve(),
    css({ output: "bundle.css" }),
    terser(),
];

const example_page_output = { sourcemap: true, format: "iife", name: "app" };

//the main distributable
//https://remarkablemark.org/blog/2019/07/12/rollup-commonjs-umd/
const dist_umd = {
    input: "src/index.js",
    output: { file: pkg.main, format: "umd", name: "SvelteObjectExplorer" },
    plugins,
};

//custom element distributable
const dist_custom_element = {
    input: "src/Examples/CustomElement/main.js",
    output: { file: "dist/custom_element.js", format: "es", name: "app" },
    plugins: [
        rolluppluginiconifysvg(),
        svelte({ compilerOptions: { customElement: true } }),
        //resolve(),
        css({ output: "bundle.css" }),
        terser(),
    ],
};

//svelte distributable does not need to be bundled and is accessed directly from package.json["svelte"]

//below are just bundles for the examples

//a copy of umd for testing
const example_page_umd_bundle = {
    input: "src/Examples/UMDmodule/main_example.js",
    output: { file: "public/UMDmodule/bundle_soe.js", format: "umd", name: "SvelteObjectExplorer" },
    plugins,
};

const example_page_umd = {
    input: "./src/Examples/UMDmodule/main.js",
    output: { ...example_page_output, file: "public/UMDmodule/bundle.js" },
    plugins: [
        svelte({ ...removeWhitespace, compilerOptions: { dev: true } }),
        css({ output: "bundle.css" }),
        resolve({ browser: true, dedupe: ["svelte"] }),
        commonjs(),
    ],
};

const example_page_svelte_component = {
    input: "./src/Examples/SvelteComponent/main.js",
    output: { ...example_page_output, file: "public/SvelteComponent/bundle.js" },
    plugins,
};

const example_page_custom_element = {
    input: "./src/Examples/CustomElement/main_example.js",
    output: { ...example_page_output, file: "public/CustomElement/bundle.js" },
    plugins,
};

export default [
    dist_umd,
    dist_custom_element,

    example_page_umd,
    example_page_umd_bundle,
    example_page_svelte_component,
    example_page_custom_element,
];
