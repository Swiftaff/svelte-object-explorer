import lib from "./lib.js";
const indentSpaces = 2;
const max_array_length = 10;
const max_line_length = 38;

export default function convertObjectToArrayOfOutputPanelRows({ key, val }) {
    let arr = [];
    // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional), len(optional)}]
    let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
    appendRowsByType(row_settings, arr);
    return arr;
}

function appendRowsByType(row_settings, arr) {
    const type = getTypeName(row_settings.val, row_settings.type, row_settings.key);
    const simpleTypes = ["string", "number", "boolean", "null", "undefined"];
    const new_settings = { ...row_settings, type };
    const type_matcher = {
        object: appendRowsForObject,
        array: appendRowsForArray,
        "ARRAY+": appendRowsForArrayLong, //raw long array, before being converted to object
        "ARRAY+OBJECT": appendRowsForArrayLongObject, //after being converted to object
        "ARRAY+SUB_ARRAY": appendRowsForArrayLongSubArray,
        symbol: appendRowForSymbol,
        function: appendRowsForFunction,
        HTML: appendRowsForSvelteExplorerTag,
        Node: appendRowsForDomNode,
    };
    if (simpleTypes.includes(type)) appendRowForSimpleTypes(new_settings, arr);
    if (type in type_matcher) type_matcher[type](new_settings, arr);
}

function getTypeName(value, type, key) {
    return type || getNullOrOtherType(value);

    function getNullOrOtherType(value) {
        return value === null ? "null" : getObjectOrStandardType(value);
    }

    function getObjectOrStandardType(value) {
        return typeof value === "object" ? getArrayOrObject(value) : typeof value;
    }

    function getArrayOrObject(value) {
        return Array.isArray(value) ? getArrayOrLongArray(value) : getObjectOrSpecialObject(value);
    }

    function getArrayOrLongArray(value) {
        return value.length > max_array_length ? "ARRAY+" : "array";
    }

    function getObjectOrSpecialObject(value) {
        const longArraySubArrayProperties = ["start", "end", "sub_array"];
        const svelteExplorerTagProperties = ["class", "svelte-explorer-tag", "children"];
        return object_has_only_these_properties(value, longArraySubArrayProperties)
            ? "ARRAY+OBJECT"
            : object_has_only_these_properties(value, svelteExplorerTagProperties)
            ? "HTML"
            : isNode(value)
            ? "Node"
            : "object";
    }

    function object_has_only_these_properties(value, arr) {
        return arr.filter((prop) => prop in value).length === arr.length;
    }

    function isNode(o) {
        return typeof Node === "object"
            ? o instanceof Node
            : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    }
}

function appendRowsForObject(row_settings, arr) {
    const children = Object.entries(row_settings.val);
    const brackets = "{}";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "object"));
    children.forEach(([k, v], i) => appendRowsByType(getRowForChild(row_settings, k, v, i), arr));
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArray(row_settings, arr) {
    let children = row_settings.val;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, row_settings.type));
    for (let i = 0; i < children.length; i++) {
        appendRowsByType(getRowForChild(row_settings, i, children[i], i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArrayLong(row_settings, arr) {
    const converted = recursive_get_chunked_array(row_settings.val);
    appendRowsForArrayLongObject({ ...row_settings, val: converted }, arr);
}

function appendRowsForArrayLongObject(row_settings, arr) {
    const item = row_settings.val;
    const brackets = "[]";
    const text = "long arrays are chunked";
    arr.push(getRowForBracketOpen(row_settings, item.end + 1, brackets, row_settings.type));
    appendRowsForArrayLongSubArray(getRowForChild(row_settings, text, item.sub_array, 1), arr, item.start);
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArrayLongSubArray(row_settings, arr, parent_item_start) {
    let item = row_settings.val;
    const brackets = "...[]";
    for (let i = 0; i < item.length; i++) {
        const key = getLongArrayRange(item[i], parent_item_start + i);
        const val = item[i];
        const indexRef = row_settings.indexRef + "." + i;
        appendRowsByType({ ...row_settings, key, val, indexRef }, arr);
    }
    function getLongArrayRange(long_array_object, i) {
        return typeof long_array_object !== "undefined" && typeof long_array_object.start !== "undefined"
            ? "{" + long_array_object.start + ".." + long_array_object.end + "}"
            : i;
    }
}

function appendRowForSimpleTypes(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const row_is_too_wide = val && "" + val.length > max_line_length - level * indentSpaces;
    if (row_is_too_wide) appendRowForSimpleTypesMultiLine(row_settings, arr);
    else arr.push({ ...rest, output: getIndentedRow(key + ": " + val, level) });
}

function appendRowForSimpleTypesMultiLine(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const available_chars_based_on_indent = max_line_length - level * indentSpaces;
    const regex_to_split_into_chunks = new RegExp("[^]{1," + available_chars_based_on_indent + "}", "gi");
    const array_of_rows = ("" + val).match(regex_to_split_into_chunks);
    const index_and_no_indent_in_first_row = (str, i) =>
        i ? getIndentedRow(" " + str, level + 1) : getIndentedRow("" + (i + 1) + ": " + str, level);
    const only_show_type_in_first_row = (settings, i) => (i ? "" : settings.type);
    let new_row_settings = row_settings;
    const push_each_row = (a, i) => {
        const output = index_and_no_indent_in_first_row(a, i);
        new_row_settings = { ...new_row_settings, output, type: only_show_type_in_first_row(new_row_settings, i) };
        // we don't change the indexRef - so that all rows have the same row reference and highlight together
        arr.push(new_row_settings, arr);
    };
    array_of_rows.map(push_each_row);
}

function appendRowsForFunction(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const val_as_string = "" + val;
    const val_as_array = val_as_string.split("\n");

    const brackets = "{}";
    const type = val_as_array[0] && val_as_array[0].substring(0, 1) === "f" ? "function" : "arrow fn";
    arr.push(getRowForBracketOpen(row_settings, val_as_array.length, brackets, type));
    for (let i = 0; i < val_as_array.length; i++) {
        const function_row = val_as_array[i].trim();
        if (!function_row.length) continue;
        appendRowsByType(getRowForChild(row_settings, i, function_row, i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowForSymbol(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    let sym = val.toString();
    if (sym !== "Symbol()") sym = `Symbol('${sym.substring(7, sym.length - 1)}')`;
    arr.push({ ...rest, output: getIndentedRow(key + ": " + sym, level) });
}

function appendRowsForSvelteExplorerTag(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const children = row_settings.val.children;
    const tag = row_settings.val["svelte-explorer-tag"].toLowerCase();
    const end_bracket = "</" + tag + ">";
    const brackets = "<" + tag + ">" + end_bracket;
    if (children.length) {
        arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "HTML", end_bracket.length));
        children.map((a, i) => appendRowsByType(getRowForChild(row_settings, i, a, i), arr));
        arr.push(getRowForBracketClose(row_settings, brackets, end_bracket.length));
    } else {
        arr.push({ ...rest, output: getIndentedRow(key + ": " + brackets, level) });
    }
}

function appendRowsForDomNode(row_settings, arr) {
    const converted = lib.domParser(row_settings.val);
    appendRowsForSvelteExplorerTag({ ...row_settings, val: converted }, arr);
}

export function recursive_get_chunked_array(supplied = [], supplied_options = {}) {
    const options = override_default_options();
    const recurrence_count = options.recurrence_count;
    const array_length_max = options.array_length_max;
    const max_recursions = options.recurrence_max;
    const initial_obj = get_obj_from_arr_or_obj(supplied);
    return get_short_or_chunked_array();

    function override_default_options() {
        return {
            recurrence_count: 0,
            recurrence_max: 4,
            array_length_max: max_array_length,
            ...supplied_options,
        };
    }

    function get_obj_from_arr_or_obj(supplied) {
        if (Array.isArray(supplied)) return { start: 0, end: supplied.length - 1, sub_array: supplied };
        else return supplied;
    }

    function get_short_or_chunked_array() {
        if (initial_obj.sub_array.length > array_length_max) return get_recursive_chunked_array();
        else return supplied;
    }

    function get_recursive_chunked_array() {
        const chunked_array = get_single_level_chunked_array(initial_obj);
        return recurse_or_return(chunked_array, initial_obj, recurrence_count);
    }

    function recurse_or_return(chunked_array, initial_obj, recurrence_count) {
        if (chunked_array.length > array_length_max && recurrence_count < max_recursions) {
            initial_obj.sub_array = chunked_array;
            return recursive_get_chunked_array(initial_obj, { ...options, recurrence_count: recurrence_count + 1 });
        } else {
            initial_obj.sub_array = chunked_array;
            return initial_obj;
        }
    }
    function get_single_level_chunked_array(initial_obj) {
        let chunked_array = [];
        for (let start = 0; start < initial_obj.sub_array.length; start += array_length_max) {
            const end = get_chunk_end(initial_obj, start);
            const chunk_array = initial_obj.sub_array.slice(start, end + 1);
            const chunk_obj = get_chunk_object(start, end, chunk_array);
            chunked_array.push(chunk_obj);
            chunked_array = get_chunked_array_without_duplicate_nested_last_item(chunked_array);
        }
        return chunked_array;
    }

    function get_chunk_end(initial_obj, start) {
        let end = start + array_length_max - 1;
        let last_item_index = initial_obj.sub_array.length - 1;
        let chunk_array_is_short = end > last_item_index;
        if (chunk_array_is_short) end = last_item_index;
        return end;
    }

    function get_chunk_object(chunk_start, chunk_end, chunk_array) {
        //get chunk range depending on if its just the root array, or from range of all child chunks
        const chunk_item_first = chunk_array[0];
        const chunk_item_last = chunk_array[chunk_array.length - 1];
        const contains_child_chunks =
            //is not just a plain array, because it has start and end items
            typeof chunk_item_first.start !== "undefined" && typeof chunk_item_last.end !== "undefined";
        const start = contains_child_chunks ? chunk_array[0].start : chunk_start;
        const end = contains_child_chunks ? chunk_array[chunk_array.length - 1].end : chunk_end;
        return { start, end, sub_array: chunk_array };
    }

    function get_chunked_array_without_duplicate_nested_last_item(chunked_array) {
        // this fixes tests 10 and 11 when the last item is a single item
        // incorrectly looks like this: { start: 9, end: 9, sub_array: { start: 9, end: 9, sub_array: [9] } }
        // correctly looks like this:   { start: 9, end: 9, sub_array: [9] }
        let last_added_chunk_object = chunked_array[chunked_array.length - 1];
        let has_only_one_items = last_added_chunk_object.sub_array.length === 1;
        let sub_item_start = last_added_chunk_object.sub_array[0].start;
        let sub_item_end = last_added_chunk_object.sub_array[0].end;
        if (
            has_only_one_items &&
            sub_item_start === last_added_chunk_object.start &&
            sub_item_end === last_added_chunk_object.end
        ) {
            chunked_array[chunked_array.length - 1] = chunked_array[chunked_array.length - 1].sub_array[0];
        }
        return chunked_array;
    }
}

function getRowForBracketOpen(row_settings, len, brackets, type, close_bracket_length = 1) {
    const text = row_settings.key + ": " + brackets;
    const output = getIndentedRow(text, row_settings.level);
    return { ...row_settings, output, type, bracket: close_bracket_length, expandable: true, len };
}

function getRowForBracketClose(row_settings, brackets, close_bracket_length = 1) {
    const close_bracket = brackets.substring(brackets.length - close_bracket_length, brackets.length);
    const output = getIndentedRow(close_bracket, row_settings.level);
    return { ...row_settings, output, type: "", bracket: close_bracket_length };
}

function getRowForChild(row_settings, key, val, index) {
    const indexRef = row_settings.indexRef + "." + index;
    const parentIndexRef = row_settings.indexRef;
    const level = row_settings.level + 1;
    return { indexRef, parentIndexRef, index, key, val, level };
}

function getIndentedRow(row, level) {
    return " ".repeat(level * indentSpaces) + row;
}
