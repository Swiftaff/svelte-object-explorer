/*
plugins = [
  {
    type_name: "name_of_type",
    // to appear in explorer row
    
    type_parser: (value) => value === "abc"
    // a fn to return a boolean based on the value matching some criteria.
    // The type_parser of each plugin will be tried in order until a true result is returned
    // otherwise if all are false, it will just revert to trying all the other basic types in 'getTypeName'

    simple: true
    // true = a simple type, like a string, can also be multi-line if required
    // false = an object-like type, like an array or object which can expand to show child elements
  },...
]
*/

const plugin1 = {
    type_name: "customType1",
    type_parser: (v) => v && v.specific_key1 && v.value_key_a,
    simple: true,
};

const plugin2 = {
    type_name: "customType2",
    type_parser: (v) => v && v.specific_key2 && v.value_key_b && v.value_key_c,
    simple: false,
};

export default [plugin1, plugin2];
