import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";
import css from "rollup-plugin-css-only";
import rolluppluginiconifysvg from "rollup-plugin-iconify-svg";

const input = "src/index.js";
const removeWhitespace = {
    preprocess: {
        markup: ({ content, filename }) => {
            return {
                code: content.replace(/>[\s]{2,}</g, "><"),
            };
        },
    },
};

export default [
    {
        input,
        output: { file: pkg.main, format: "umd", name: "SvelteObjectExplorer" },
        plugins: [svelte(removeWhitespace), resolve(), css({ output: "bundle.css" })],
    },
    {
        input,
        output: { file: pkg.module, format: "es" },
        //external: ["svelte/internal"],
        plugins: [svelte(removeWhitespace), resolve(), css({ output: "bundle.css" })],
    },
    {
        input: "src/custom_element/main.js",
        output: { file: "dist/custom_element.js", format: "es", name: "app" }, //, globals: ["svelte"] },
        //external: ["document"],
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "src/custom_element", dest: "src/custom_element/icons.js" }],
            }),
            svelte({ compilerOptions: { customElement: true, dev: false } }),
            resolve({
                browser: true,
                dedupe: ["svelte"],
            }),
            css({ output: "bundle.css" }),
            //commonjs(),
        ],
    },
];
