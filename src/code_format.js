const indentSpaces = 2;
const long_array_max = 3; //10;
const max_recursions = 4;

export default function convertObjectToArrayOfOutputPanelRows({ key, val }) {
    let arr = [];
    // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional), len(optional)}]
    let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
    appendRowsByType(row_settings, arr);
    console.log("outputRowsArray", arr);
    return arr;
}

function appendRowsByType(row_settings, arr) {
    let type = getTypeName(row_settings.val);
    let new_settings = { ...row_settings, type };
    if (type === "object") appendRowsForObject(new_settings, arr);
    if (type === "array") appendRowsForArrayLarge(new_settings, arr);
    if (type === "string") appendRowForString(new_settings, arr);
}

function getTypeName(value) {
    let type = getNullOrOtherType(value);
    return type;

    function getNullOrOtherType(value) {
        return value === null ? "null" : getObjectOrStandardType(value);
    }

    function getObjectOrStandardType(value) {
        return typeof value === "object" ? getArrayOrObject(value) : typeof value;
    }

    function getArrayOrObject(value) {
        return Array.isArray(value) ? "array" : "object";
    }
}

function appendRowsForObject(row_settings, arr) {
    const children = Object.entries(row_settings.val);
    const brackets = "{}";
    arr.push(getRowForBracketOpen(row_settings, children, brackets, "object"));
    children.forEach(([k, v], i) => {
        appendRowsByType(getRowsForChild(row_settings, k, v, i), arr);
    });
    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

function appendRowsForArray(row_settings, arr) {
    if (row_settings.val.length <= long_array_max) {
        appendRowsForArraySmall(row_settings, arr);
    } else {
        appendRowsForArrayLarge(row_settings, arr);
    }
}

function power(n, p) {
    let result = n;
    for (let index = 0; index < p; index++) {
        result = result * n;
    }
    return result;
}

/*
function split_array_into_chunks(arr, chunk_length) {
    let return_array = [];
    for (let start = 0; start < arr.length + 1; start++) {
        const end = (start + 1) * chunk_length > arr.length ? arr.length : (start + 1) * chunk_length;
        const sub_array = arr.slice(start * chunk_length, end);
        if (sub_array.length) {
            //console.log("test", start, end, sub_array);
            return_array.push(sub_array);
        }
    }
    return return_array;
}
*/

/*
tests...
1.
x=3
input=[1,2,3,4]
recursive_get_chunked_children(supplied) =
[{ start: 0, end: 3, sub_array:
  [
    { start: 0, end: 2, sub_array: [1,2,3]},
    { start: 3, end: 3, sub_array: [4]}
  ]
}]

2.
x=3
input=[1,2,3,4,5,6,7,8,9,10]
recursive_get_chunked_children(supplied) =
[{ start: 0, end: 9, sub_array:
  [
    { start: 0, end: 8, sub_array:
      [
        { start: 0, end: 2, sub_array: [1,2,3]},
        { start: 3, end: 5, sub_array: [4,5,6]},
        { start: 6, end: 8, sub_array: [7,8,9]}
      ],
    { start: 9, end: 9, sub_array:
      [
        { start: 9, end: 9, sub_array: [10]}
      ]
    }
  ]
}]
*/

function recursive_get_chunked_children(supplied, recurred = 0) {
    console.log("1. recursive_get_chunked_children", recurred);
    let arr = get_array_from_array_or_object(supplied);

    const start = 0 * (recurred + long_array_max);
    const end = arr.length - 1;
    const range = "{" + start + "-" + end + "}";
    const sub_array_object = get_sub_array(arr, start, recurred);
    console.log("5. sub_array", sub_array_object.sub_array.length, range);

    if (sub_array_object.sub_array.length <= long_array_max || recurred > max_recursions) {
        return sub_array_object;
    } else {
        return recursive_get_chunked_children(sub_array_object, recurred + 1);
    }
}

function get_array_from_array_or_object(supplied) {
    if (Array.isArray(supplied)) return supplied;
    else return get_array_from_object_or_empty(supplied);
}

function get_array_from_object_or_empty(supplied) {
    if (supplied && supplied.sub_array && Array.isArray(supplied.sub_array)) {
        return supplied.sub_array;
    } else return [];
}

function get_sub_array(arr, range_start, recurred) {
    const return_array = [];
    let multiplier = long_array_max || 1;
    for (let start = 0; start < arr.length + 1; start += long_array_max) {
        const end = start + long_array_max > arr.length ? arr.length - 1 : start + long_array_max - 1;
        const sub_array = arr.slice(start, end + 1);
        const len = sub_array.length;

        if (sub_array.length) {
            const text = "{" + start + "-" + end + "}";
            console.log("2. get_sub_array", start, end, recurred, range_start);
            //0, 2, 1, 0
            //3, 3, 1, 0
            return_array.push({
                start,
                end,
                multiplier,
                sub_array,
                recurred,
                range_start,
            });
            /*
        const rowsForChildSubArray = getRowsForChild(row_settings, "text", transformed_children_array, 0);
        console.log("rowsForChildSubArray", rowsForChildSubArray);
        appendRowsByType(rowsForChildSubArray, arr);
        */
        }
    }
    let chunk_start = 0;
    let chunk_end = 0;

    if (
        return_array &&
        return_array.length &&
        return_array[0] &&
        return_array[return_array.length - 1] &&
        typeof return_array[0].start !== "undefined" &&
        typeof return_array[return_array.length - 1].end !== "undefined"
    ) {
        chunk_start = return_array[0].start * multiplier;
        chunk_end = return_array[return_array.length - 1].end * multiplier;
        console.log("3. chunk", chunk_start, chunk_end);
    }
    let ret = { start: chunk_start, end: chunk_end, sub_array: return_array, multiplier, recurred, range_start };
    console.log("4. ret", JSON.parse(JSON.stringify(ret)));
    return ret;
}

function appendRowsForArrayLarge(row_settings, arr) {
    const children = row_settings.val;
    //console.log(children);
    let index = 0;
    const brackets = "[]";
    const type = children.length > long_array_max ? "array+" : "array";
    arr.push(getRowForBracketOpen(row_settings, [], brackets, type));

    let transformed_children_array = children;
    let nesting = 0;
    console.log("0. ", transformed_children_array);
    if (transformed_children_array.length > long_array_max) recursive_get_chunked_children(transformed_children_array);

    /*
    for (let index = 0; index < 5; index++) {
        //console.log("loop");
        if (transformed_children_array.length > long_array_max) {
            transformed_children_array = split_array_into_chunks(transformed_children_array, long_array_max);
            nesting++;
        } else {
            break;
        }
    }
    */

    //console.log("transformed_children_array", transformed_children_array);
    //get_sub_array(transformed_children_array);

    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

function appendRowsForArraySmall(row_settings, arr) {
    const children = row_settings.val;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, children, brackets, "array"));
    for (let i = 0; i < children.length; i++) {
        appendRowsByType(getRowsForChild(row_settings, i, children[i], i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets[1]));
}

function appendRowForString(row_settings, arr) {
    let { key, val, level, ...rest } = row_settings;
    arr.push({ ...rest, output: indent_row(key + ": " + val, level), type: "string" });
}

function getRowForBracketOpen(row_settings, children, brackets, type) {
    //const items = children.length + " item" + (children.length > 1 ? "s" : "");
    const text = row_settings.key + ": " + brackets; //brackets[0] + " " + items + " " + brackets[1];
    const output = indent_row(text, row_settings.level);
    return { ...row_settings, output, type, bracket: true, expandable: true, len: children.length };
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

// --- old below

//formatByType("0.0", "0", 0, parentArr, object, 0);
function formatByType(
    //
    indexRef,
    parentIndexRef, //e.g. "1.1.2.3"
    index, // e.g. 4, if this item is 1.1.2.3.4
    //
    parentArr,
    value,
    level,
    optionalIndex,
    optionalNewLine
) {
    //console.log("formatByType", value);
    if (value === null) code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
    else if (typeof value === "undefined")
        code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
    else if (typeof value === "boolean")
        code_format_boolean(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
    //else if (typeof value === "string")
    //    code_format_string(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
    else if (typeof value === "number")
        code_format_number(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
    else if (typeof value === "symbol")
        code_format_symbol(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
    else if (typeof value === "function")
        code_format_function(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
    else if (Array.isArray(value))
        if (value.length > 100) {
            code_format_array_long(
                indexRef,
                parentIndexRef,
                index,
                parentArr,
                value,
                level,
                optionalIndex,
                optionalNewLine
            );
        } else {
            code_format_array(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine);
        }
    /*else if (typeof value === "object") {
        if (value["svelte-explorer-tag"]) {
            code_format_svelte_explorer_tag(
                indexRef,
                parentIndexRef,
                index,
                parentArr,
                value,
                level,
                optionalIndex,
                optionalNewLine
            );
        } else {
            code_format_object(
                indexRef,
                parentIndexRef,
                index,
                parentArr,
                value,
                level,
                optionalIndex,
                optionalNewLine
            );
        }
    
    }*/ else code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
}

function get_indent(row_object, type) {
    return indent_row(code_format_index(row_object.optionalIndex) + type, row_object.level);
}

function code_format_null(row_object, parentArr) {
    //indexRef, parentIndexRef, index, parentArr, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "null"),
        type: "Null",
    });
}

function code_format_undefined(row_object, parentArr) {
    //indexRef, parentIndexRef, index, parentArr, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "undefined"),
        type: "Undefined",
    });
}

function code_format_boolean(row_object, parentArr, bool) {
    //indexRef, parentIndexRef, index, parentArr, bool, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, bool ? "true" : "false"),
        type: "Boolean",
    });
}

function code_format_string(row_object, parentArr, str) {
    //indexRef, parentIndexRef, index, parentArr, str, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "'" + str + "'"),
        type: "String",
    });
}

function code_format_number(row_object, parentArr, num) {
    //indexRef, parentIndexRef, index, parentArr, num, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, num),
        type: "Number",
    });
}

function code_format_symbol(row_object, parentArr, sym) {
    //indexRef, parentIndexRef, index, parentArr, sym, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "'" + sym.toString() + "'"),
        type: "Symbol",
    });
}

function code_format_function(row_object, parentArr, fn) {
    //indexRef, parentIndexRef, index, parentArr, fn, level, optionalIndex
    parentArr.push({
        ...row_object,
        output: get_indent(row_object, "'" + fn.name + "'"),
        type: "Function",
    });
}

/*
function code_format_array(row_object, parentArr, arr) {
    //indexRef, parentIndexRef, index, parentArr, arr, level, optionalIndex, optionalNewLine
    if (optionalIndex !== "children") {
        parentArr.push({
            ...row_object,
            output: indent_row(
                (optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex),
                level
            ),
            type: "Array",
            len: arr.length,
            expandable: true,
        });
        if (optionalNewLine) {
            parentArr.push({
                indexRef,
                parentIndexRef,
                index,
                output: indent_row("[", level + (optionalIndex ? 1 : 0)),
                bracket: true,
            });
        }
    }

    arr.map((value, arrIndex) =>
        formatByType(
            indexRef + "." + arrIndex,
            indexRef,
            arrIndex,
            parentArr,
            value,
            level + (optionalIndex ? 2 : 1),
            arrIndex,
            true
        )
    );
    if (optionalIndex !== "children") {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row("]", level + (optionalIndex ? 1 : 0)),
            bracket: true,
        });
    }
}
*/

function code_format_array_long(
    row_object,
    parentArr,
    arr
    //TODO update in line with normal array when done
) {
    //indexRef, parentIndexRef, index, parentArr, arr, level, optionalIndex, optionalNewLine
    code_format_string(row_object, parentArr, "Array is very long (" + arr.length + ")");
    for (let i = 0; i < arr.length; i += 100) {
        let end = i + 100 > arr.length - 1 ? arr.length : i + 99;
        let tempArr = arr.slice(i, end);
        code_format_array(
            {
                ...row_object,
                indexRef: row_object.indexRef + "." + i,
                level: row_object.level + 1,
                optionalIndex: row_object.optionalIndex + " (" + i + " to " + end + ")",
            },
            parentArr,
            tempArr
        );
    }
}

function code_format_object(indexRef, parentIndexRef, index, parentArr, obj, level, optionalIndex, optionalNewLine) {
    let object = Object.entries(obj);
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(
            (optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex),
            level
        ),
        type: "Object",
        len: object.length,
        expandable: true,
    });
    if (optionalNewLine) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row("{", level + (optionalIndex ? 1 : 0)),
            bracket: true,
        });
    }
    object.forEach(([key, value], objIndex) => {
        formatByType(
            indexRef + "." + objIndex,
            indexRef,
            objIndex,
            parentArr,
            value,
            level + (optionalIndex || optionalNewLine ? 2 : 1),
            key,
            true
        );
    });
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row("}", level + (optionalIndex || optionalNewLine ? 1 : 0)),
        bracket: true,
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
