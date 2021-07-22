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
  },...
}
*/

const customType1 = {
    type_parser: (v) => v && v.specific_key1 && v.value_key_a, // defined as an object with these 2 keys
    transform: (value) => `${value.specific_key1} [${value.value_key_a}]`, // displays as string with 2 keys joined
};

const customType2 = {
    type_parser: (v) => v && typeof v === "string" && v.includes("string:"), // defined as string containing "string:"
    //transform: undefined // displays as string, no transformation needed
};

const customType3 = {
    type_parser: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c, // defined as an object with these 2 keys
    transform: (value) => {
        const { specific_key2, ...rest } = value;
        return rest; // displays as an object, and for some reason we want to display only 2 of it's keys
    },
};

export default { customType1, customType2, customType3 };
