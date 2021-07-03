function domParser(node) {
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }

    let html = node || document.body;
    //console.log(html);
    let arr = getTag(html);
    //console.log(arr);

    function getTag(el) {
        if (el && el.tagName && el.tagName !== "SCRIPT" && !el.className.includes("svelte-object-explorer-wrapper ")) {
            const textContent = el && el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild.textContent : "";
            return {
                class: el.className,
                "svelte-explorer-tag": el.tagName,
                children: getChildren(el),
                textContent,
            };
        } else {
            return null;
        }
    }

    function getChildren(el) {
        return [...el.childNodes].map(getTag).filter((t) => t !== null);
    }
    return arr;
}

export default { domParser };
