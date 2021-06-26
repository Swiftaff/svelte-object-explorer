const test = require("ava");

import { recursive_get_chunked_array, recursive_get_chunked_children } from "../src/code_format.js";

test("recursive_get_chunked_array 0", async (t) => {
    const input = [];
    const expected_output = [];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 1", async (t) => {
    const input = [0];
    const expected_output = [0];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 2", async (t) => {
    const input = [0, 1];
    const expected_output = [0, 1];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 3", async (t) => {
    const input = [0, 1, 2];
    const expected_output = [0, 1, 2];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 4", async (t) => {
    const input = [0, 1, 2, 3];
    const expected_output = {
        start: 0,
        end: 3,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 3, sub_array: [3] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 5", async (t) => {
    const input = [0, 1, 2, 3, 4];
    const expected_output = {
        start: 0,
        end: 4,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 4, sub_array: [3, 4] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 6", async (t) => {
    const input = [0, 1, 2, 3, 4, 5];
    const expected_output = {
        start: 0,
        end: 5,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 5, sub_array: [3, 4, 5] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 7", async (t) => {
    const input = [0, 1, 2, 3, 4, 5, 6];
    const expected_output = {
        start: 0,
        end: 6,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 5, sub_array: [3, 4, 5] },
            { start: 6, end: 6, sub_array: [6] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 8", async (t) => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7];
    const expected_output = {
        start: 0,
        end: 7,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 5, sub_array: [3, 4, 5] },
            { start: 6, end: 7, sub_array: [6, 7] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 9", async (t) => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const expected_output = {
        start: 0,
        end: 8,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 5, sub_array: [3, 4, 5] },
            { start: 6, end: 8, sub_array: [6, 7, 8] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 10", async (t) => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const expected_output = {
        start: 0,
        end: 9,
        sub_array: [
            {
                start: 0,
                end: 8,
                sub_array: [
                    { start: 0, end: 2, sub_array: [0, 1, 2] },
                    { start: 3, end: 5, sub_array: [3, 4, 5] },
                    { start: 6, end: 8, sub_array: [6, 7, 8] },
                ],
            },
            { start: 9, end: 9, sub_array: [9] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    console.log("output", output.sub_array);
    console.log("expected_output", expected_output.sub_array);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 11", async (t) => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const expected_output = {
        start: 0,
        end: 10,
        sub_array: [
            {
                start: 0,
                end: 8,
                sub_array: [
                    { start: 0, end: 2, sub_array: [0, 1, 2] },
                    { start: 3, end: 5, sub_array: [3, 4, 5] },
                    { start: 6, end: 8, sub_array: [6, 7, 8] },
                ],
            },
            { start: 9, end: 10, sub_array: [9, 10] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
