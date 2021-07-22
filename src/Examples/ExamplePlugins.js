/*
plugins = {
  "name_of_type": {
  // to appear in explorer row

    type_parser: (value) => value === "abc"
    // a fn to return a boolean based on the value matching some criteria.
    // The type_parser of each plugin will be tried in order until a true result is returned
    // otherwise if all are false, it will just revert to trying all the other basic types in 'getTypeName'

    simple: (value) => `${value.specific_key1} [${value.value_key_a}]`
    // true / fn = either supply true or a function to convert the supplied value into a simple string
    //             e.g. as above example, if the value is an object with many keys, perhaps only show two of its key/vals concatenated
    //             or true = the value will just become the string
    // false     = it is an object-like type, like an array or object, which can expand to show child elements
  },...
}
*/

const customType1 = {
    type_name: "customType1",
    type_parser: (v) => v && v.specific_key1 && v.value_key_a,
    simple: (value) => `${value.specific_key1} [${value.value_key_a}]`,
};

const customType2 = {
    type_name: "customType2",
    type_parser: (v) => v && typeof v === "string" && v.includes("string:"),
    simple: true,
};

const customType3 = {
    type_name: "customType3",
    type_parser: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c,
    simple: false,
};

export default { customType1, customType2, customType3 };
