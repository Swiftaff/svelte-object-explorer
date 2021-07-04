function domParser(node) {
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }

    let html = node || document.body;
    //console.log(html);
    let arr = getTag(html);
    //console.log(arr);

    function getTag(el) {
        if (el && el.tagName && el.tagName !== "SCRIPT" && !el.className.includes("svelte-object-explorer-wrapper ")) {
            const textContent = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild.textContent : "";
            const svelteExplorerTag = isSvelteExplorerTag(el) ? el.dataset["svelteExplorerTag"] : el.tagName;
            return {
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
        return [...el.childNodes].map(getTag).filter((t) => t !== null);
    }
    return arr;
}

export default { domParser };
