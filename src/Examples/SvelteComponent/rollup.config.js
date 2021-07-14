import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import css from "rollup-plugin-css-only";

export default {
    input: "./src/Examples/SvelteComponent/main.js",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "public/SvelteComponent/bundle.js",
    },
    plugins: [
        svelte({ compilerOptions: { dev: true } }),
        css({ output: "bundle.css" }),
        resolve({ browser: true, dedupe: ["svelte"] }),
        commonjs(),
    ],
};
