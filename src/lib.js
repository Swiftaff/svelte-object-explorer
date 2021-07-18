function domParser(node) {
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }
    //console.log("NODE", node);
    let html = node || document.body;
    //console.log("html", html);
    let arr = getTag(html);
    //console.log("arr", arr);

    function getTag(el) {
        //console.log("getTag", el.tagName);
        if (
            el &&
            el.nodeName &&
            el.nodeName !== "SCRIPT" &&
            el.nodeName !== "SVELTE-OBJECT-EXPLORER" &&
            (!el.className || (el.className && !el.className.includes("svelte-object-explorer-wrapper ")))
        ) {
            const textContent = el.nodeName === "#text" ? el.nodeValue : "";
            const svelteExplorerTag = isSvelteExplorerTag(el) ? el.dataset["svelteExplorerTag"] : el.nodeName;
            return textContent
                ? textContent
                : {
                      class: el.className,
                      "svelte-explorer-tag": svelteExplorerTag,
                      children:
                          isSvelteExplorerTag(el) &&
                          svelteExplorerTag.substring(0, 3) !== "#if" &&
                          svelteExplorerTag.substring(0, 5) !== "#each" &&
                          svelteExplorerTag.substring(0, 6) !== "#await"
                              ? []
                              : getChildren(el),
                      textContent,
                  };
        } else {
            return null;
        }
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
