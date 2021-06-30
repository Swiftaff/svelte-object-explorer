const indentSpaces = 2;
const max_array_length = 10;

export default function convertObjectToArrayOfOutputPanelRows({ key, val }) {
    let arr = [];
    // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional), len(optional)}]
    let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
    appendRowsByType(row_settings, arr);
    console.log("outputRowsArray", arr);
    return arr;
}

function appendRowsByType(row_settings, arr) {
    const type = getTypeName(row_settings.val, row_settings.type, row_settings.key);
    const simpleTypes = ["string", "number", "boolean", "null", "undefined"];
    const new_settings = { ...row_settings, type };
    if (type === "object") appendRowsForObject(new_settings, arr);
    if (type === "array") appendRowsForArray(new_settings, arr);
    if (type === "ARRAY+") appendRowsForArrayLong(new_settings, arr); //not converted yet
    if (type === "ARRAY+OBJECT") appendRowsForArrayLongObject(new_settings, arr); //converted
    if (type === "ARRAY+SUB_ARRAY") appendRowsForArrayLongSubArray(new_settings, arr); //converted
    if (simpleTypes.includes(type)) appendRowForSimpleTypes(new_settings, arr);
    if (type === "symbol") appendRowForSymbol(new_settings, arr);
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
        return Array.isArray(value) ? getArrayOrLongArray(value) : getObjectOrLongArraySubArray(value);
    }

    function getArrayOrLongArray(value) {
        return value.length > max_array_length ? "ARRAY+" : "array";
    }

    function getObjectOrLongArraySubArray(value) {
        const is_long_array_object =
            typeof value.start !== "undefined" &&
            typeof value.end !== "undefined" &&
            typeof value.sub_array !== "undefined" &&
            Array.isArray(value.sub_array);
        //if (is_long_array_object) console.log("YES");
        return is_long_array_object ? "ARRAY+OBJECT" : "object";
    }
}

function appendRowsForObject(row_settings, arr) {
    const children = Object.entries(row_settings.val);
    const brackets = "{}";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "object"));
    children.forEach(([k, v], i) => {
        appendRowsByType(getRowsForChild(row_settings, k, v, i), arr);
    });
    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

export function recursive_get_chunked_array(supplied = [], supplied_options = {}) {
    const options = get_options();
    const recurrence_count = options.recurrence_count;
    const array_length_max = options.array_length_max;
    const max_recursions = options.recurrence_max;
    const initial_obj = get_obj_from_arr_or_obj(supplied);
    return get_short_or_chunked_array();

    function get_options() {
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
        if (initial_obj.sub_array.length > array_length_max) {
            return get_recursive_chunked_array();
        } else {
            return supplied;
        }
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

function appendRowsForArray(row_settings, arr) {
    let children = row_settings.val;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, row_settings.type));
    for (let i = 0; i < children.length; i++) {
        appendRowsByType(getRowsForChild(row_settings, i, children[i], i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

function appendRowsForArrayLong(row_settings, arr) {
    const converted = recursive_get_chunked_array(row_settings.val);
    appendRowsForArrayLongObject({ ...row_settings, val: converted }, arr);
}

function appendRowsForArrayLongObject(row_settings, arr) {
    const item = row_settings.val;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, item.end + 1, brackets, row_settings.type));
    //console.log("!!!", row_settings);
    //appendRowForString(getRowsForChild({ ...row_settings, type: "" }, "long arrays are chunked", "", 0), arr);
    appendRowsForArrayLongSubArray(
        getRowsForChild(row_settings, "long arrays are chunked", item.sub_array, 1),
        arr,
        item.start
    );
    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

function appendRowsForArrayLongSubArray(row_settings, arr, parent_item_start) {
    let item = row_settings.val;
    const brackets = "...[]";
    for (let i = 0; i < item.length; i++) {
        appendRowsByType(
            {
                ...row_settings,
                key: getLongArrayRange(item[i], parent_item_start + i),
                val: item[i],
                indexRef: row_settings.indexRef + "." + i,
            },
            arr
        );
    }
}

function getLongArrayRange(long_array_object, i) {
    return typeof long_array_object !== "undefined" && typeof long_array_object.start !== "undefined"
        ? "{" + long_array_object.start + ".." + long_array_object.end + "}"
        : i;
}

function appendRowForSimpleTypes(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    arr.push({ ...rest, output: indent_row(key + ": " + val, level) });
}

function appendRowForSymbol(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    let sym = val.toString();
    if (sym !== "Symbol()") sym = `Symbol('${sym.substring(7, sym.length - 1)}')`;
    arr.push({ ...rest, output: indent_row(key + ": " + sym, level) });
}

function getRowForBracketOpen(row_settings, len, brackets, type) {
    //const items = children.length + " item" + (children.length > 1 ? "s" : "");
    const text = row_settings.key + ": " + brackets; //brackets[0] + " " + items + " " + brackets[1];
    const output = indent_row(text, row_settings.level);
    return { ...row_settings, output, type, bracket: true, expandable: true, len };
}

function getRowForBracketClose(row_settings, close_bracket) {
    const output = indent_row(close_bracket, row_settings.level);
    return { ...row_settings, output, type: "", bracket: true };
}

function getRowsForChild(row_settings, key, val, index) {
    const indexRef = row_settings.indexRef + "." + index;
    const parentIndexRef = row_settings.indexRef;
    const level = row_settings.level + 1;
    return { indexRef, parentIndexRef, index, key, val, level };
}

//bigint?

// --- old below

//formatByType("0.0", "0", 0, parentArr, object, 0);

function code_format_function(row_object, parentArr, fn) {
    //indexRef, parentIndexRef, index, parentArr, fn, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "'" + fn.name + "'"),
        type: "Function",
    });
}

function code_format_svelte_explorer_tag(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    obj,
    level,
    optionalIndex,
    optionalNewLine
) {
    let object = Object.entries(obj);
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(
            (optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex),
            level
        ),
        type: "Tag",
        tag: indent_row("<" + obj["svelte-explorer-tag"].toLowerCase() + ">", level),
        len: object.length,
        expandable: true,
    });

    object.forEach(([key, value], objIndex) => {
        if (key === "children") {
            formatByType(
                indexRef, // + "." + objIndex,
                indexRef,
                objIndex,
                parentArr,
                value,
                level,
                key,
                true
            );
        }
    });
}

function code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "!!unknown!!", level),
    });
}

function code_format_index(optionalIndex) {
    return typeof optionalIndex !== "undefined" ? optionalIndex + ": " : "";
}

function indent_row(row, level) {
    return " ".repeat(level * indentSpaces) + row;
}
