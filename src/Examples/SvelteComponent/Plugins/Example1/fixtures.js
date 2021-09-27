const value = {
    string: "testy",
    array: ["one", "two", "three"],
    object: { test1: "test1", test2: "test2" },
    number: 123,
};

const test1 = {
    value,
};

const test2 = {
    value: { ...value, test_string: "valuecontainingabc" },
    plugins: {
        MyCustomType: {
            type_parser: (value) => typeof value === "string" && value.includes("abc"),
            row_html: (row_settings, globals) => {
                return {
                    ...row_settings,
                    html: `<div class="test2">containsABC: ${row_settings.val}</div>`,
                };
            },
        },
    },
};

const test3 = {
    value: { ...value, test_string: "valuecontainingabc" },
    plugins: {
        // same name as existing type
        string: {
            //type_parser: (v) => typeof v === "string",
            transform: (v) => v + "!",
        },
    },
};

export default { test1, test2, test3 };
