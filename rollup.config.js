import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
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
    //terser(),
];

//the main distributable
//https://remarkablemark.org/blog/2019/07/12/rollup-commonjs-umd/
const umd_dist = {
    input: "src/index.js",
    output: { file: pkg.main, format: "umd", name: "SvelteObjectExplorer" },
    plugins,
};

//custom element distributable
const custom_element_dist = {
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
const umd_bundle_for_example = {
    input: "src/Examples/UMDmodule/main_example.js",
    output: { file: "public/UMDmodule/bundle_soe.js", format: "umd", name: "SvelteObjectExplorer" },
    plugins,
};

export default [umd_dist, umd_bundle_for_example, custom_element_dist];
