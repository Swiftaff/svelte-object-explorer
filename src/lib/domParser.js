function domParser(optional_node, optional_plugins) {
    //console.log("domParser");
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }
    //console.log("NODE", node);
    let html = optional_node || document.body;
    let plugins = optional_plugins || {};
    //console.log("html", html);
    let arr = getTag(html);
    //console.error("arr", arr);
    return arr;

    function getTag(el) {
        //console.log("getTag", el.tagName);
        if (isHtmlNodeOrSvelteExplorerTag(el)) {
            const isExpander = getExpanderFromPlugins(el, plugins);
            //if (isExpander) console.log("isExpander", el.getAttribute("value"));
            const isSETag = isSvelteExplorerTag(el);
            const textContent = el.nodeName === "#text" ? el.nodeValue : "";
            const svelteExplorerTag = isSETag ? el.dataset["svelteExplorerTag"] : el.nodeName;
            const svelteExplorerTagType = isSETag ? el.dataset["svelteExplorerTagType"] : "";
            const svelteExplorerTagShape = isSETag ? el.dataset["svelteExplorerTagShape"] : "whole";
            let children = getChildren(el);
            if (isExpander) {
                children = [];
                /* [
                    {
                        class: "",
                        value: el["svelte-explorer-value"],
                        "svelte-explorer-tag": "testy",
                        is_svelte_explorer_tag: false,
                        "svelte-explorer-tag-type": "pin",
                        "svelte-explorer-tag-shape": "whole",
                        children: [],
                        is_svelte_explorer_expander: false,
                        textContent, //TODO check if just not needed if it is always ""?
                    },
                ]; */
            }
            return textContent
                ? textContent
                : {
                      value: isExpander ? el["svelte-explorer-value"] : null,
                      class: el.className,
                      "svelte-explorer-tag": svelteExplorerTag,
                      is_svelte_explorer_tag: isSETag,
                      "svelte-explorer-tag-type": svelteExplorerTagType,
                      "svelte-explorer-tag-shape": svelteExplorerTagShape,
                      children,
                      is_svelte_explorer_expander: isExpander,
                      textContent, //TODO check if just not needed if it is always ""?
                  };
        } else {
            return null;
        }
    }

    function getExpanderFromPlugins(el, plugins) {
        let parsed_plugin_expander = false;
        Object.entries(plugins).find((plugin_array) => {
            if (plugin_array[1] && plugin_array[1].row_expander && plugin_array[1].row_expander(el)) {
                parsed_plugin_expander = plugin_array[0];
                return true; // find breaks loop on true
            } else {
                return false;
            }
        });
        return parsed_plugin_expander;
    }

    function isHtmlNodeOrSvelteExplorerTag(el) {
        return (
            el &&
            el.nodeName &&
            el.nodeName !== "SCRIPT" &&
            el.nodeName !== "SVELTE-OBJECT-EXPLORER" &&
            (!el.className || (el.className && !el.className.includes("svelte-object-explorer-wrapper ")))
        );
    }

    function isSvelteExplorerTag(el) {
        //console.log(1, el.nodeName);
        return el.dataset && el.dataset["svelteExplorerTag"];
    }

    function getChildren(el) {
        const removeUnecessaryItems = (t) => t !== null;
        return [...el.childNodes].map(getTag).filter(removeUnecessaryItems);
    }
}

export default domParser;
