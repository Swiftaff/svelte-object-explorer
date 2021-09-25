function domParser(options = {}) {
    // parses the dom from supplied node downwards into a simplified ast, e.g.
    // el = { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }
    let html = (options && options.node) || document.body;
    let plugins = (options && options.plugins) || {};
    let expand = (options && options.expand) || ((el) => el.nodeName === "SVELTE-EXPLORER-EXPAND");
    let arr = getTag(html);
    return arr;

    function getTag(el) {
        if (isHtmlNodeOrSvelteExplorerTag(el)) {
            const isExpander = getExpanderFromPlugins(el, plugins);
            const isSETag = isSvelteExplorerTag(el);
            const textContent = el.nodeName === "#text" ? el.nodeValue : "";
            const svelteExplorerTag = isSETag ? el.dataset["svelteExplorerTag"] : el.nodeName;
            const svelteExplorerTagType = isSETag ? el.dataset["svelteExplorerTagType"] : "";
            const svelteExplorerTagShape = isSETag ? el.dataset["svelteExplorerTagShape"] : "whole";
            const children = isExpander ? [] : getChildren(el);
            return textContent
                ? textContent
                : {
                      class: el.className,
                      children,

                      is_svelte_explorer_tag: isSETag,
                      "svelte-explorer-tag": svelteExplorerTag,
                      "svelte-explorer-tag-type": svelteExplorerTagType,
                      "svelte-explorer-tag-shape": svelteExplorerTagShape,
                      value: isExpander ? el["svelte-explorer-value"] : null,

                      is_svelte_explorer_expander: isExpander,
                  };
        } else return null;
    }

    function getExpanderFromPlugins(el, plugins) {
        let parsed_plugin_expander = false;
        Object.entries(plugins).find((plugin_array) => {
            if (plugin_array[1] && plugin_array[1].row_expander && plugin_array[1].row_expander(el)) {
                parsed_plugin_expander = plugin_array[0];
                return true; // find breaks loop on true
            } else return false;
        });
        return parsed_plugin_expander;
    }

    function isHtmlNodeOrSvelteExplorerTag(el) {
        const has_a_nodeName = el && el.nodeName;
        const is_not_a_script_node = has_a_nodeName && el.nodeName !== "SCRIPT";
        const is_not_part_of_explorer_panel =
            has_a_nodeName &&
            el.nodeName !== "SVELTE-OBJECT-EXPLORER" &&
            (!el.className || (el.className && !el.className.includes("svelte-object-explorer-wrapper ")));
        return is_not_a_script_node && is_not_part_of_explorer_panel;
    }

    function isSvelteExplorerTag(el) {
        return el.dataset && el.dataset["svelteExplorerTag"];
    }

    function getChildren(el) {
        const removeUnecessaryItems = (t) => t !== null;
        return [...el.childNodes].map(getTag).filter(removeUnecessaryItems);
    }
}

export default domParser;
