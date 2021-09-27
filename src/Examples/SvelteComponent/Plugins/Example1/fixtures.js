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
                value_parser: (value) => typeof value === "string" && value.includes("abc"),
                row_html: (row_settings, globals) => {
                    return {
                        ...row_settings,
                        html: `<div class="test2">containsABC: ${row_settings.val}</div>`,
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
                value_parser: (v) => typeof v === "string",
                transform: (v) => v + "!",
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
                value_parser: (v) => typeof v === "object" && "key1" in v && "key10" in v,
                transform: (v) => `${v.key1} (${v.key10})`,
            },
        ],
    },
};

export default { test1, test2, test3, test4 };
