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
    settings: {
        rows: [
            {
                match: (value) => typeof value === "string" && value.includes("abc"),
                row_html: (row_settings, globals) => {
                    return {
                        ...row_settings,
                        html: `<div class="test2" style="color:red">containsABC: ${row_settings.val}</div>`,
                    };
                },
            },
        ],
    },
};

const test3 = {
    value: { ...value, test_string: "valuecontainingabc" },
    settings: {
        rows: [
            {
                match: (v) => typeof v === "string",
                value: (v) => v + "!",
            },
        ],
    },
};

const test4 = {
    value: {
        ...value,
        test_object: {
            key1: "test1",
            key2: "test2",
            key3: "test3",
            key4: "test4",
            key5: "test5",
            key6: "test6",
            key7: "test7",
            key8: "test8",
            key9: "test9",
            key10: "test10",
        },
    },
    settings: {
        rows: [
            {
                match: (v) => typeof v === "object" && "key1" in v && "key10" in v,
                value: (v) => `${v.key1} (${v.key10})`,
            },
        ],
    },
};

const test5 = {
    value: {
        ...value,
        test_object: {
            key1: "test1",
            key2: "test2",
            key3: "test3",
            key4: "test4",
            key5: "test5",
            key6: "test6",
            key7: "test7",
            key8: "test8",
            key9: "test9",
            key10: "test10",
        },
    },
    settings: {
        rows: [
            {
                match: (v) => typeof v === "object" && "key1" in v && "key10" in v,
                type: "my_type",
            },
        ],
    },
};

const test6 = {
    value: { ...value, test_string: "valuecontainingabc" },
    settings: {
        rows: [
            {
                match: (value) => typeof value === "string" && value.includes("abc"),
                row_render: (current_row_settings, globals) => {
                    console.log("globals", current_row_settings);
                    return {
                        ...current_row_settings,
                        // update as many of the default settings as required
                        // based on current row settings or not...
                        indent: (current_row_settings.level + 5) * globals.indentSpaces,
                        key: "mykey",
                        val: `containsABC: ${current_row_settings.val}`,
                        type: "my_type",
                    };
                },
            },
        ],
    },
};

const test7 = {
    value: {
        ...value,
        test_string1: "valuecontainingabc",
        test_string2: "valuecontainingabc1",
        test_string3: "valuecontainingabc12",
    },
    settings: {
        rows: [
            {
                match: (v) => typeof v === "string" && v.includes("valuecontainingabc"),
                value: (v) => v + "-1",
            },
            {
                match: (v) => typeof v === "string" && v.includes("valuecontainingabc12"),
                value: (v) => v + "2",
            },
            {
                match: (v) => typeof v === "string" && v.includes("valuecontainingabc1"),
                value: (v) => v + "3",
            },
        ],
    },
};

export default { test1, test2, test3, test4, test5, test6 };
