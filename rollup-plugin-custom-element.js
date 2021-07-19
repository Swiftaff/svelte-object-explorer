import pify from "pify";
import fs from "fs";
const { readFile, writeFile } = pify(fs);

export const move_styles_to_root_element = (filepath) => {
    // workaround for https://github.com/sveltejs/svelte/issues/4274
    return {
        writeBundle() {
            transformCeCss(filepath).catch((err) => {
                console.error(err);
            });
        },
    };
};

const transformCeCss = async (file) => {
    const code = await readFile(file, { encoding: "utf8" });
    const transformed = transform(code);
    await writeFile(file, transformed);
};
const assignment = "this.shadowRoot.innerHTML = ";

const transform = (code) => {
    const parts = code.split(assignment);
    let aggregated = "";
    const partsWithOnlyOneStyle = parts.map((part, i) => {
        const withoutAnyStyleString = part.replace(/^`<style>(.+?)<\/style>`;/, (_, css) => {
            aggregated += css;
            return "";
        });

        if (i === parts.length - 1) {
            return assignment + "`<style>" + aggregated + "<style>`;" + withoutAnyStyleString;
        }

        return withoutAnyStyleString;
    });

    return partsWithOnlyOneStyle.join("");
};

//---
const removeWhiteSpaceFunction = (content) => content.replace(/>[\s]{2,}</g, "><");

export const removeWhitespace = {
    preprocess: {
        markup: ({ content, filename }) => {
            return { code: removeWhiteSpaceFunction(content) };
        },
    },
};

//---

export const create_custom_element = {
    preprocess: {
        markup: ({ content, filename }) => {
            const new_content = prepend_content_with_svelte_options_tag(content, filename);
            return { code: new_content };
        },
    },
    compilerOptions: { customElement: true },
};

function prepend_content_with_svelte_options_tag(content, filepath) {
    const tag = get_svelte_options_tag(filepath);
    return tag + removeWhiteSpaceFunction(content); //remove whitespace as previously

    function get_svelte_options_tag(filepath) {
        const component_name = get_component_name(filepath);
        const line_breaks = `
      
      `;
        return `<svelte:options tag="${component_name}" />${line_breaks}`;
    }

    function get_component_name(filepath) {
        const base_name = "svelte-object-explorer";
        const is_base_component = filepath.includes("Index.svelte");
        return is_base_component ? base_name : base_name + get_sub_component_name(filepath);
    }

    function get_sub_component_name(filepath) {
        const filename = get_filename(filepath);
        return replace_capitals_with_dashes_and_lowercase(filename);
    }

    function get_filename(filepath) {
        const start = 4; //removes 4 "src/" chars from start
        const end = filepath.length - 7; //removes 7 ".svelte" chars from end
        return filepath.substring(start, end);
    }

    function replace_capitals_with_dashes_and_lowercase(txt) {
        const regex_to_find_capitals = /([A-Z])/g;
        return txt.replace(regex_to_find_capitals, "-$1").toLowerCase();
    }
}
