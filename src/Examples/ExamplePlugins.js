/*
plugins = {
    "name_of_type": {
    // type to appear in explorer row.
    // If required you can replace one or more of the existing standard types

    type_parser: (value) => value === "abc"
    // a function to define this type by returning a boolean based on the value matching some criteria.
    // The type_parser of each plugin will be tried in order until a true result is returned
    // otherwise if all are false, it will just revert to trying all the other basic types in 'getTypeName'

    transform: (value) => `${value.specific_key1} [${value.value_key_a}]`
    // function = supply a function to convert the supplied value into something else
    //            e.g. as above example, if the value is an object with many keys,
    //            perhaps only show two of its key/vals concatenated
    // falsey   = no transformation needed, displays as-is

    row_render: (row_settings, globals) => { return row_settings }
    // function = supply a function to generate the required output rows in the panel, overriding any standard
    // falsey   = it will use the standard row_render for the base type of your value

    row_html: (row_settings, globals) => { return row_settings }
    // function = supply a function to generate html for the required output rows in the panel, overriding any standard
    //            This then totally bypasses the svelte-object-explorer text display so you can fully customise the html within each row!
    // falsey   = it will use the standard row_render for the base type of your value
  },...
}
*/

const customType1a = {
    type_parser: (v) => v && v.specific_key1 && v.value_key_a, // defined as an object with these 2 keys
    transform: (v) => `${v.specific_key1} [${v.value_key_a}]`, // displays as string with 2 keys joined
    row_render: (row_settings, globals) => {
        const { level } = row_settings;
        return {
            ...row_settings,
            val: "*" + row_settings.val,
            indent: level * globals.indentSpaces,
        };
    },
};

const customType1b = {
    type_parser: (v) => v && v.specific_key1 && v.value_key_a && v.value_key_b, // defined as an object with these 3 keys
    transform: (v) => `${v.specific_key1} [${v.value_key_a}${v.value_key_b}]`, // displays as string with 3 keys joined
    row_render: (row_settings, globals) => {
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
    type_parser: (v) => v && typeof v === "string" && v.includes("string:"), // defined as string containing "string:"
    //transform: undefined // displays as string, no transformation needed
};

const customType3 = {
    type_parser: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c, // defined as an object with these 3 keys
    transform: (v) => {
        const { specific_key2, ...rest } = v;
        return rest; // displays as an object, and for some reason we want to display only 2 of it's keys
    },
};

const customType4 = {
    type_parser: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c && v.value_key_d, // defined as an object with these 4 keys
    row_html: (row_settings, globals) => {
        const margin = row_settings.level * globals.indentSpaces * 10 + "px";
        const text = row_settings.val.specific_key2;
        const html = `<div style="background-color: red; margin-left:${margin}">${text}</div>`;
        return { ...row_settings, html };
    },
};

//TODO - ordering matters, change to array

export default { customType1b, customType1a, customType2, customType4, customType3 };
