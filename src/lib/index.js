import domParser from "./domParser.js";
import codeFormat from "./codeFormat.js";

function convertDataToRows(cache) {
    let outputRows = [];
    let rootObject = {
        key: "Svelte Object Explorer",
        val: cache.value,
        class: "",
        valType: "",
    };
    const { rows, expanded } = codeFormat(rootObject, cache.plugins, cache.settings);
    rootObject.childRows = rows;
    outputRows.push(rootObject);
    outputRows.sort(sort_byKey);
    outputRows = outputRows.map((item, index) => ({ ...item, index }));
    return { rows: outputRows, expanded };
}

function sort_byKey(a, b) {
    var nameA = a.key.toUpperCase(); // ignore upper and lowercase
    var nameB = b.key.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0; // else name are equal
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

function replacer(_, value) {
    if (typeof value === "undefined") {
        return "testing";
    } else {
        return value;
    }
}

export default { domParser, codeFormat, convertDataToRows, getOpenIndex, formatDate, replacer };
