const customType1a = {
    match: (v) => v && v.specific_key1 && v.value_key_a && Object.keys(v).length === 3, // defined as an object with these 2 keys
    value: (v) => `${v.specific_key1} [${v.value_key_a}]`, // displays as string with 2 keys joined
    type: "customType1a",
    row_details: (row_settings, globals) => {
        const { level } = row_settings;
        return {
            ...row_settings,
            val: "*" + row_settings.val,
            indent: level * globals.indentSpaces,
        };
    },
};

const customType1b = {
    match: (v) => v && v.specific_key1 && v.value_key_a && v.value_key_b, // defined as an object with these 3 keys
    value: (v) => `${v.specific_key1} [${v.value_key_a}${v.value_key_b}]`, // displays as string with 3 keys joined
    type: "customType1b",
    row_details: (row_settings, globals) => {
        //renders multiple rows
        const { level } = row_settings;
        return [
            {
                ...row_settings,
                val: "*" + row_settings.val,
                indent: level * globals.indentSpaces,
                is_multiline: true,
                is_first_multiline: true,
            },
            {
                ...row_settings,
                val: "second line",
                indent: row_settings.key.length + 2 + level * globals.indentSpaces,
                key: "",
                type: "",
                is_multiline: true,
                is_last_multiline: true,
            },
        ];
    },
};

const customType2 = {
    match: (v) => v && typeof v === "string" && v.includes("string:"), // defined as string containing "string:"
    type: "customType2",
    //value: undefined // displays as string, no transformation needed
};

const customType3 = {
    match: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c && Object.keys(v).length === 4, // defined as an object with these 3 keys
    value: (v) => {
        const { specific_key2, ...rest } = v;
        return rest; // displays as an object, and for some reason we want to display only 2 of it's keys
    },
    type: "customType3",
};

const customType4 = {
    match: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c && v.value_key_d, // defined as an object with these 4 keys
    html: (row_settings, globals) => {
        const margin = row_settings.level * globals.indentSpaces * 10 + "px";
        const text = row_settings.val.specific_key2;
        const html = `<div style="background-color: red; margin-left:${margin}">${text}</div>`;
        return { ...row_settings, html };
    },
};

export default [customType1b, customType1a, customType2, customType4, customType3];
