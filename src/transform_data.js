import code_format from "../src/code_format.js";

function transform_data(cache) {
    let tempArr = [];
    let tempItem = {
        key: "Svelte Object Explorer",
        val: cache.myStore,
    };
    tempItem.class = "";
    tempItem.valType = "";
    tempItem.childRows = code_format(tempItem);
    tempArr.push(tempItem);
    tempArr.sort(sort_byKey);
    tempArr = tempArr.map((item, index) => {
        return { ...item, index };
    });
    return tempArr;
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

function getOpenIndex(arr, open, openIndexSetOnce) {
    console.log(arr);
    let i = null;
    if (arr && arr.length) {
        arr.map((item, index) => {
            if (item.key === open && (item.type === "object" || item.type == "array")) i = index;
            openIndexSetOnce = true;
        });
    }
    return i;
}

function getAllIndexes(arrayToMap, openIndex) {
    //update the showallarray with all rows from parentArr
    //console.log(arrayToMap, openIndex);
    let arr = [];
    if (openIndex && arrayToMap[openIndex] && arrayToMap[openIndex].childRows)
        arrayToMap[openIndex].childRows.map((row) => {
            arr.push(row.index);
        });
    return arr;
}

export default { transform_data, getOpenIndex, getAllIndexes };
