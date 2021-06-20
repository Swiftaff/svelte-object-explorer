const indentSpaces = 2;
const long_array_max = 10;

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
    if (type === "array") appendRowsForArray(new_settings, arr);
    if (type === "string") appendRowForString(new_settings, arr);
}

function getTypeName(value) {
    let type = getNullOrOtherType(value);
    console.log("type", type);
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

function appendRowsForArrayLarge(row_settings, arr) {
    const children = row_settings.val;
    console.log(children);
    console.log();
    let index = 0;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, children, brackets, "array"));
    for (let i = 0; i < children.length; i += long_array_max) {
        const end = i + long_array_max > children.length - 1 ? children.length : i + long_array_max - 1;
        const childSubArray = children.slice(i, end);
        const rowsForChildSubArray = getRowsForChild(row_settings, index, childSubArray, index);
        appendRowsByType(rowsForChildSubArray, arr);
        console.log("loop", i, childSubArray, rowsForChildSubArray);
        index++;
    }
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
