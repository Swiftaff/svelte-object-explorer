const test = require("ava");
const options = { array_length_max: 3 };

import { recursive_get_chunked_array } from "../src/code_format.js";

test("recursive_get_chunked_array 0 for 3s", async (t) => {
    const input = [];
    const expected_output = [];
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 1 for 3s", async (t) => {
    const input = [0];
    const expected_output = [0];
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 2 for 3s", async (t) => {
    const input = [0, 1];
    const expected_output = [0, 1];
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 3 for 3s", async (t) => {
    const input = [0, 1, 2];
    const expected_output = [0, 1, 2];
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 4 for 3s", async (t) => {
    const input = [0, 1, 2, 3];
    const expected_output = {
        start: 0,
        end: 3,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 3, sub_array: [3] },
        ],
    };
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 5 for 3s", async (t) => {
    const input = [0, 1, 2, 3, 4];
    const expected_output = {
        start: 0,
        end: 4,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 4, sub_array: [3, 4] },
        ],
    };
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 6 for 3s", async (t) => {
    const input = [0, 1, 2, 3, 4, 5];
    const expected_output = {
        start: 0,
        end: 5,
        sub_array: [
            { start: 0, end: 2, sub_array: [0, 1, 2] },
            { start: 3, end: 5, sub_array: [3, 4, 5] },
        ],
    };
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 7 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 8 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 9 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 10 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 11 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 22 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 27 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    t.deepEqual(output, expected_output);
});

test("recursive_get_chunked_array 28 for 3s", async (t) => {
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
    const output = recursive_get_chunked_array(input, options);
    //console.log(JSON.stringify(output));
    t.deepEqual(output, expected_output);
});

// the following use default values - no options sent

test("recursive_get_chunked_array 0 for 10s", async (t) => {
    const input = [];
    const expected_output = [];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
test("recursive_get_chunked_array 1 for 10s", async (t) => {
    const input = [0];
    const expected_output = [0];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
test("recursive_get_chunked_array 10 for 10s", async (t) => {
    const input = new Array(10).fill("x").map((x, i) => i);
    const expected_output = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
test("recursive_get_chunked_array 11 for 10s", async (t) => {
    const input = new Array(11).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 10,
        sub_array: [
            { start: 0, end: 9, sub_array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
            { start: 10, end: 10, sub_array: [10] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
test("recursive_get_chunked_array 100 for 10s", async (t) => {
    const input = new Array(100).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 99,
        sub_array: [
            { start: 0, end: 9, sub_array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
            { start: 10, end: 19, sub_array: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
            { start: 20, end: 29, sub_array: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
            { start: 30, end: 39, sub_array: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
            { start: 40, end: 49, sub_array: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49] },
            { start: 50, end: 59, sub_array: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
            { start: 60, end: 69, sub_array: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69] },
            { start: 70, end: 79, sub_array: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
            { start: 80, end: 89, sub_array: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89] },
            { start: 90, end: 99, sub_array: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
test("recursive_get_chunked_array 101 for 10s", async (t) => {
    const input = new Array(101).fill("x").map((x, i) => i);
    const expected_output = {
        start: 0,
        end: 100,
        sub_array: [
            {
                start: 0,
                end: 99,
                sub_array: [
                    { start: 0, end: 9, sub_array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
                    { start: 10, end: 19, sub_array: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
                    { start: 20, end: 29, sub_array: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
                    { start: 30, end: 39, sub_array: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
                    { start: 40, end: 49, sub_array: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49] },
                    { start: 50, end: 59, sub_array: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
                    { start: 60, end: 69, sub_array: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69] },
                    { start: 70, end: 79, sub_array: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
                    { start: 80, end: 89, sub_array: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89] },
                    { start: 90, end: 99, sub_array: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99] },
                ],
            },
            { start: 100, end: 100, sub_array: [100] },
        ],
    };
    const output = recursive_get_chunked_array(input);
    t.deepEqual(output, expected_output);
});
