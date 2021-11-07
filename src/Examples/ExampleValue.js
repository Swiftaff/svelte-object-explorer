const exampleArray = [
    { first: "Bob", surname: "Marley" },
    { first: "John", surname: "Lennon" },
    { first: "The Chuckle", surname: "Brothers" },
];

const exampleValue = {
    html: null,
    string1: "testy",
    longstring:
        "Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.",
    array: exampleArray,
    array2: [[["test1", "test2"], "test2"], "test2"],
    longarray: new Array(101).fill("x").map((x, i) => "" + i),
    object: {
        test1: {
            test1: { test1: { test1: "test1", test2: "test2" }, test2: "test2" },
            test2: "test2",
        },
        test2: "test2",
    },
    number1: 123,
    number2: 123.456789,
    //number3: 9007199254740992n * 2,
    boolean1: true,
    boolean2: false,
    null: null,
    undefined: undefined,
    symbol1: Symbol(),
    symbol2: Symbol("foo"),
    arrowfunction: () => {},
    arrowfunction2: (a, b, c, d) => {
        console.log("long, long, long, long comment test");
        arrowfunction();
    },
    function: function test(a, b, c, d) {
        console.log("test");
    },
    deep: {
        deep: {
            deep: {
                deep: {
                    deep: {
                        arrowfunction2: (a, b, c, d) => {
                            console.log("long, long, long, long comment test");
                            arrowfunction();
                        },
                    },
                },
            },
        },
        SvelteVariable: null, //counter
    },
    SvelteVariable: null,
    customStore: null,
    customStoreValue: null,
    pluginTest1a: {
        name: "custom_object1",
        specific_key1: "test1",
        value_key_a: "abc",
    },
    pluginTest1b: {
        name: "custom_object1",
        specific_key1: "test1",
        value_key_a: "abc",
        value_key_b: "123",
    },
    pluginTest2: "string: starts with string",
    pluginTest3: {
        name: "custom_object2",
        specific_key2: "test2",
        value_key_b: "ABC",
        value_key_c: 2,
    },
    pluginTest4: {
        name: "custom_object2",
        specific_key2: "test2",
        value_key_b: "ABC",
        value_key_c: 2,
        value_key_d: Symbol("test"),
    },
};

module.exports = { exampleArray, exampleValue };
