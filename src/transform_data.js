import code_format from "../src/code_format.js";

function transform_data(cache) {
    let tempArr = [];
    let tempItem = {
        key: "Svelte Object Explorer",
        val: cache.value,
    };
    tempItem.class = "";
    tempItem.valType = "";
    const { rows, expanded } = code_format(tempItem, cache.plugins);
    tempItem.childRows = rows;
    tempArr.push(tempItem);
    tempArr.sort(sort_byKey);
    tempArr = tempArr.map((item, index) => {
        return { ...item, index };
    });
    return { rows: tempArr, expanded };
}

function displayValType(val) {
    if (val === null) {
        return "null";
    } else if (getType(val) === "function") {
        return "fn()";
    } else if (getType(val) === "object") {
        return Object.entries(val).length ? "view Obj..." : "{ }";
    } else if (getType(val) === "array") {
        return val.length ? "view Arr..." : "[ ]";
    } else if (getType(val) === "boolean") {
        return val ? "true" : "false";
    } else if (getType(val) === "string") {
        return val;
    } else if (getType(val) === "number") {
        return JSON.stringify(val);
    }
}

function getType(val) {
    return Array.isArray(val) ? "array" : typeof val;
}

function displayClass(testy) {
    let isObject = testy.val ? Object.entries(testy.val).length : false;
    return testy.val !== [] && testy.val !== null && isObject ? " tree_" : "";
}

function sort_byKey(a, b) {
    var nameA = a.key.toUpperCase(); // ignore upper and lowercase
    var nameB = b.key.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // else name are equal
    return 0;
}

function getOpenIndex(arr, item_requested_to_open) {
    let i = null;
    if (item_requested_to_open && arr && arr[0] && arr[0].childRows) {
        const all_items_under_svelte_object_explorer = arr[0].childRows;
        all_items_under_svelte_object_explorer.map((item) => {
            if (item_requested_to_open === item.key && item.expandable) i = item.indexRef;
        });
    }
    return i;
}

function formatDate(d) {
    return (
        d.toDateString() +
        " " +
        d.getUTCHours() +
        ":" +
        d.getUTCMinutes() +
        ":" +
        d.getUTCSeconds() +
        ":" +
        d.getUTCMilliseconds()
    );
}

export default { transform_data, getOpenIndex, formatDate };
