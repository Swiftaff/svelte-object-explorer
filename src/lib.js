function domParser(optional_node, optional_plugins) {
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }
    //console.log("NODE", node);
    let html = optional_node || document.body;
    let plugins = optional_plugins || {};
    //console.log("html", html);
    let arr = getTag(html);
    //console.log("arr", arr);

    function getTag(el) {
        //console.log("getTag", el.tagName);
        if (isHtmlNodeOrSvelteExplorerTag(el)) {
            const isSETag = isSvelteExplorerTag(el);
            const isExpander = getExpanderFromPlugins(el, plugins);
            const textContent = el.nodeName === "#text" ? el.nodeValue : "";
            const svelteExplorerTag = isSETag ? el.dataset["svelteExplorerTag"] : el.nodeName;
            const svelteExplorerTagType = isSETag ? el.dataset["svelteExplorerTagType"] : "";
            const svelteExplorerTagShape = isSETag ? el.dataset["svelteExplorerTagShape"] : "whole";
            return textContent
                ? textContent
                : isExpander
                ? { is_svelte_explorer_expander: true }
                : {
                      class: el.className,
                      "svelte-explorer-tag": svelteExplorerTag,
                      is_svelte_explorer_tag: isSETag,
                      "svelte-explorer-tag-type": svelteExplorerTagType,
                      "svelte-explorer-tag-shape": svelteExplorerTagShape,
                      children: getChildren(el),
                      /*isSvelteExplorerTag(el)
                          && svelteExplorerTag.substring(0, 10) !== "#component" &&
                          svelteExplorerTag.substring(0, 3) !== "#if" &&
                          svelteExplorerTag.substring(0, 5) !== "#each" &&
                          svelteExplorerTag.substring(0, 6) !== "#await"
                          ? []
                          : getChildren(el),*/
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
        return el.dataset && el.dataset["svelteExplorerTag"];
    }

    function getChildren(el) {
        const removeUnecessaryItems = (t) => t !== null;
        return [...el.childNodes].map(getTag).filter(removeUnecessaryItems);
    }
    return arr;
}

export default { domParser };
