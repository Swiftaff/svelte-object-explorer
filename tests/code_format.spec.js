const test = require("ava");

import { recursive_get_chunked_children } from "../src/code_format.js";

test("recursive_get_chunked_children 3", async (t) => {
    const input = [0, 1, 2];
    const expected_output = { end: 2, start: 0, sub_array: [0, 1, 2] };
    const output = recursive_get_chunked_children(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_children 4", async (t) => {
    const input = [0, 1, 2, 3];
    const expected_output = {
        end: 3,
        start: 0,
        sub_array: [{ end: 2, start: 0, sub_array: [0, 1, 2] }, 3],
    };
    const output = recursive_get_chunked_children(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_children 5", async (t) => {
    const input = [0, 1, 2, 3, 4];
    const expected_output = {
        end: 4,
        start: 0,
        sub_array: [{ end: 2, start: 0, sub_array: [0, 1, 2] }, 3, 4],
    };
    const output = recursive_get_chunked_children(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_children 6", async (t) => {
    const input = [0, 1, 2, 3, 4, 5];
    const expected_output = {
        end: 4,
        start: 0,
        sub_array: [
            { end: 2, start: 0, sub_array: [0, 1, 2] },
            { end: 3, start: 5, sub_array: [3, 4, 5] },
        ],
    };
    const output = recursive_get_chunked_children(input);
    console.log("output", output);
    console.log("expected_output", expected_output);
    t.deepEqual(output, expected_output);
});
