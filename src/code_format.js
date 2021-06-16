const indentSpaces = 2;

function code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "null", level),
        type: "Null",
    });
}

function code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "undefined", level),
        type: "Undefined",
    });
}

function code_format_boolean(indexRef, parentIndexRef, index, parentArr, bool, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + (bool ? "true" : "false"), level),
        type: "Boolean",
    });
}

function code_format_string(indexRef, parentIndexRef, index, parentArr, str, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "'" + str + "'", level),
        type: "String",
    });
}

function code_format_number(indexRef, parentIndexRef, index, parentArr, num, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + num, level),
        type: "Number",
    });
}

function code_format_symbol(indexRef, parentIndexRef, index, parentArr, sym, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "'" + sym.toString() + "'", level),
        type: "Symbol",
    });
}

function code_format_function(indexRef, parentIndexRef, index, parentArr, fn, level, optionalIndex) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row(code_format_index(optionalIndex) + "'" + fn.name + "'", level),
        type: "Function",
    });
}

function code_format_array(indexRef, parentIndexRef, index, parentArr, arr, level, optionalIndex, optionalNewLine) {
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
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
    parentArr.push({
        indexRef,
        parentIndexRef,
        index,
        output: indent_row("]", level + (optionalIndex ? 1 : 0)),
        bracket: true,
    });
}

function code_format_array_long(
    indexRef,
    parentIndexRef,
    index,
    parentArr,
    arr,
    level,
    optionalIndex,
    optionalNewLine
) {
    code_format_string(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        "Array is very long (" + value.length + ")",
        level,
        optionalIndex
    );
    for (let i = 0; i < value.length; i += 100) {
        let end = i + 100 > value.length - 1 ? value.length : i + 99;
        let tempArr = value.slice(i, end);
        code_format_array(
            indexRef + "." + i,
            parentIndexRef,
            index,
            parentArr,
            tempArr,
            level + 1,
            optionalIndex + " (" + i + " to " + end + ")",
            optionalNewLine
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
    else if (typeof value === "string")
        code_format_string(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
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
    else if (typeof value === "object")
        code_format_object(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine);
    else code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
}

export default function valueFormatterToArr(object) {
    //console.log("valueFormatterToArr");
    let parentArr = []; //[{ output: '   test:"test"', type: "string" }];
    formatByType("0.0", "0", 0, parentArr, object, 0); // <- make this assign to parentArr specifically instead of with JS magic

    return parentArr;
}
