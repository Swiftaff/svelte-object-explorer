import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import pkg from "./package.json";

const input = "src/index.js";
const removeWhitespace = {
    preprocess: {
        markup: ({ content, filename }) => {
            return {
                code: content.replace(/>[\s]{2,}</g, "><")
            };
        }
    }
};

export default [
    {
        input,
        output: { file: pkg.main, format: "umd", name: "SvelteObjectExplorer" },
        plugins: [svelte(removeWhitespace), resolve()]
    },
    {
        input,
        output: { file: pkg.module, format: "es" },
        external: ["svelte/internal"],
        plugins: [svelte(removeWhitespace)]
    }
];
