import domParser from "./domParser.js";
const indentSpaces = 2;
const max_array_length = 10;
const max_line_length = 38;
let global_plugins = {};
let global_expanded = [];

export default function convertObjectToArrayOfOutputPanelRows({ key, val }, supplied_plugins) {
    let rows = [];
    global_plugins = supplied_plugins;
    // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional), len(optional)}]
    let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
    appendRowsByType(row_settings, rows);
    return { rows, expanded: global_expanded };
}

function appendRowsByType(row_settings, arr) {
    const type_formatters = {
        object: appendRowsForObject,
        array: appendRowsForArray,
        "ARRAY+": appendRowsForArrayLong, // raw long array, before being converted to object
        "ARRAY+OBJECT": appendRowsForArrayLongObject, // after being converted to object
        "ARRAY+SUB_ARRAY": appendRowsForArrayLongSubArray,
        symbol: appendRowForSymbol,
        function: appendRowsForFunction,
        HTML: appendRowsForSvelteExplorerTag,
        Node: appendRowsForDomNode,
        ...getSimpleTypesObj(["string", "number", "boolean", "null", "undefined"]),
    };
    apply_formatter_for_type(type_formatters, row_settings, arr);
}

function globalExpandedPush(rowIndex) {
    const parents = rowIndex.split(".");
    let thisIndex = "";
    parents.forEach((parent, i) => {
        const dot_except_first = i ? "." : "";
        thisIndex = thisIndex + dot_except_first + parent;
        global_expanded = global_expanded.filter((row) => row !== thisIndex);
        global_expanded.push(thisIndex);
    });
}

function apply_formatter_for_type(type_formatters, row_settings, arr) {
    const is_svelte_explorer_expander =
        row_settings && row_settings.val && row_settings.val["is_svelte_explorer_expander"];
    const new_settings = getUpdatedTypeAndValue(row_settings, is_svelte_explorer_expander);
    if (is_svelte_explorer_expander) {
        globalExpandedPush(new_settings.indexRef);
        type_formatters[new_settings.format_type](new_settings, arr);
    }
    if (new_settings.row_render) append_arr_with_plugin_rows(new_settings, arr);
    else if (new_settings.row_html) append_arr_with_plugin_html(new_settings, arr);
    else if (new_settings.format_type in type_formatters) type_formatters[new_settings.format_type](new_settings, arr);
}

function getUpdatedTypeAndValue(row_settings, bool_for_testing) {
    let val = row_settings.val;
    let row_render, row_html;
    const type = getTypeName(val, bool_for_testing);
    if (type in global_plugins) {
        if (global_plugins[type].transform) val = global_plugins[type].transform(val);
        row_render = global_plugins[type].row_render; //may be undefined
        row_html = global_plugins[type].row_html; //may be undefined
    }

    const format_type = getNullOrOtherType(val);
    return { ...row_settings, val, type, format_type, row_render, row_html };
}

function append_arr_with_plugin_rows(settings, arr) {
    const globals = { indentSpaces };
    const { row_render } = settings;
    let new_settings = row_render(settings, globals);

    if (!Array.isArray(new_settings)) new_settings = [new_settings];
    new_settings.forEach((row) => arr.push(row));
}

function append_arr_with_plugin_html(settings, arr) {
    const globals = { indentSpaces };
    const { row_html } = settings;
    let new_settings = row_html(settings, globals);

    if (new_settings) {
        if (!Array.isArray(new_settings)) new_settings = [new_settings];
        new_settings.forEach((row) => {
            if (row.insert_children) {
                for (let i = 0; i < row.val.children.length; i++) {
                    const child_row = getRowForChild(row, i, row.val.children[i], i);
                    appendRowsByType(child_row, arr);
                }
            } else arr.push(row);
        });
    }
}

function getSimpleTypesObj(simpleTypes) {
    const simpleTypesObj = {};
    simpleTypes.forEach((t) => (simpleTypesObj[t] = appendRowForSimpleTypes));
    return simpleTypesObj;
}

function getTypeName(value, bool_for_testing) {
    return global_plugins && Object.keys(global_plugins).length
        ? getTypeFromPlugins(value, bool_for_testing)
        : getNullOrOtherType(value);
}

function getTypeFromPlugins(value, bool_for_testing) {
    // similar to domParser.js > getExpanderFromPlugins
    let parsed_plugin_type = false;
    Object.entries(global_plugins).find((plugin_array) => {
        if (plugin_array[1] && plugin_array[1].type_parser && plugin_array[1].type_parser(value)) {
            parsed_plugin_type = plugin_array[0];
            return true; // find breaks loop on true
        } else return false;
    });
    return parsed_plugin_type || getNullOrOtherType(value);
}

// default types below

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
    const svelteExplorerTagProperties = ["class", "svelte-explorer-tag", "children", "textContent"];
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

function appendRowsForObject(row_settings, arr) {
    const children = Object.entries(row_settings.val);
    const brackets = "{}";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, row_settings.type));
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
    const { level, val } = row_settings;
    const row_is_too_wide = val && ("" + val).length > max_line_length - level * indentSpaces;
    if (row_is_too_wide) appendRowForSimpleTypesMultiLine({ ...row_settings, val }, arr);
    else arr.push({ ...row_settings, indent: level * indentSpaces });
}

function appendRowForSimpleTypesMultiLine(row_settings, arr) {
    const { key, val, level } = row_settings; //, ...rest } = row_settings;
    const key_length = ("" + key).length;
    const available_chars_based_on_indent = max_line_length - key_length - level * indentSpaces;
    const regex_to_split_into_chunks = new RegExp("[^]{1," + available_chars_based_on_indent + "}", "gi");
    const array_of_rows = ("" + val).match(regex_to_split_into_chunks);
    const only_show_type_in_first_row = (settings, i) => (i ? "" : settings.type);
    let new_row_settings = row_settings;
    const push_each_row = (val_new, i, a) => {
        const key_new = i ? "" : key; //only show key in first row of multiline
        const indent = i ? key_length + level + 3 : level + 1;
        new_row_settings = {
            ...new_row_settings,
            //...rest,
            key: key_new,
            val: val_new,
            indent: indent,
            is_multiline: true,
            is_first_multiline: i === 0,
            is_last_multiline: i === a.length - 1,
            type: only_show_type_in_first_row(new_row_settings, i),
        };
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
    const type = val_as_array[0] && val_as_array[0].substring(0, 8) === "function" ? "function" : "arrow fn";
    arr.push(getRowForBracketOpen(row_settings, val_as_array.length, brackets, type));
    for (let i = 0; i < val_as_array.length; i++) {
        const function_row = val_as_array[i].trim();
        if (!function_row.length) continue;
        appendRowsByType(getRowForChild(row_settings, i, function_row, i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowForSymbol(row_settings, arr) {
    const { key, val, level } = row_settings;
    let val_new = val.toString();
    if (val_new !== "Symbol()") val_new = `Symbol('${val_new.substring(7, val_new.length - 1)}')`;
    arr.push({ ...row_settings, key, val: val_new, indent: level * indentSpaces });
}

function appendRowsForDomNode(row_settings, arr) {
    const converted = domParser(row_settings.val, global_plugins);
    appendRowsForSvelteExplorerTag({ ...row_settings, val: converted }, arr);
}

function appendRowsForSvelteExplorerTag(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const text = row_settings.val;
    const is_svelte_explorer_expander = row_settings.val.is_svelte_explorer_expander;
    const children = is_svelte_explorer_expander ? [row_settings.val.value] : row_settings.val.children;
    const tag = row_settings.val["svelte-explorer-tag"].toLowerCase();
    const is_svelte_tag = ["#", "/", ":"].includes(tag[0]);
    const start_bracket = "<" + tag;
    const end_bracket = is_svelte_tag ? ">" : "</" + tag + ">";
    const brackets = is_svelte_tag ? start_bracket + end_bracket : start_bracket + ">" + end_bracket;
    const has_text = text.length ? 1 : 0;

    if (is_svelte_explorer_expander) appendRowsByType({ ...row_settings, val: row_settings.val.value }, arr);
    else if (children.length || has_text) {
        arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "HTML", end_bracket.length));
        if (has_text) appendRowsByType(getRowForChild(row_settings, "", text, 0), arr);
        else {
            children.forEach((a, i) => appendRowsByType(getRowForChild(row_settings, i, a, i), arr));
            arr.push(getRowForBracketClose(row_settings, brackets, end_bracket.length));
        }
    } else arr.push({ ...rest, key, val: brackets, indent: level * indentSpaces });
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
    return {
        ...row_settings,
        val: brackets,
        indent: row_settings.level * indentSpaces,
        type,
        bracket: close_bracket_length,
        expandable: true,
        len,
    };
}

function getRowForBracketClose(row_settings, brackets, close_bracket_length = 1) {
    const close_bracket = brackets.substring(brackets.length - close_bracket_length, brackets.length);
    return {
        ...row_settings,
        key: "",
        val: close_bracket,
        indent: row_settings.level * indentSpaces,
        type: "",
        bracket: close_bracket_length,
    };
}

function getRowForChild(row_settings, key, val, index) {
    const indexRef = row_settings.indexRef + "." + index;
    const parentIndexRef = row_settings.indexRef;
    const level = row_settings.level + 1;
    return { indexRef, parentIndexRef, index, key, val, level };
}
