const test = require("ava");

import { recursive_get_chunked_array } from "../src/code_format.js";

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

test("recursive_get_chunked_array 22", async (t) => {
    const input = new Array(22).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 21,
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
            {
                start: 9,
                end: 17,
                sub_array: [
                    { start: 9, end: 11, sub_array: [9, 10, 11] },
                    { start: 12, end: 14, sub_array: [12, 13, 14] },
                    { start: 15, end: 17, sub_array: [15, 16, 17] },
                ],
            },
            {
                start: 18,
                end: 21,
                sub_array: [
                    { start: 18, end: 20, sub_array: [18, 19, 20] },
                    { start: 21, end: 21, sub_array: [21] },
                ],
            },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 27", async (t) => {
    const input = new Array(27).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 26,
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
            {
                start: 9,
                end: 17,
                sub_array: [
                    { start: 9, end: 11, sub_array: [9, 10, 11] },
                    { start: 12, end: 14, sub_array: [12, 13, 14] },
                    { start: 15, end: 17, sub_array: [15, 16, 17] },
                ],
            },
            {
                start: 18,
                end: 26,
                sub_array: [
                    { start: 18, end: 20, sub_array: [18, 19, 20] },
                    { start: 21, end: 23, sub_array: [21, 22, 23] },
                    { start: 24, end: 26, sub_array: [24, 25, 26] },
                ],
            },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 28", async (t) => {
    const input = new Array(28).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 27,
        sub_array: [
            {
                start: 0,
                end: 26,
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
                    {
                        start: 9,
                        end: 17,
                        sub_array: [
                            { start: 9, end: 11, sub_array: [9, 10, 11] },
                            { start: 12, end: 14, sub_array: [12, 13, 14] },
                            { start: 15, end: 17, sub_array: [15, 16, 17] },
                        ],
                    },
                    {
                        start: 18,
                        end: 26,
                        sub_array: [
                            { start: 18, end: 20, sub_array: [18, 19, 20] },
                            { start: 21, end: 23, sub_array: [21, 22, 23] },
                            { start: 24, end: 26, sub_array: [24, 25, 26] },
                        ],
                    },
                ],
            },
            {
                start: 27,
                end: 27,
                sub_array: [27],
            },
        ],
    };
    const output = recursive_get_chunked_array(input);
    //console.log(JSON.stringify(output));
    t.deepEqual(output, expected_output);
});
