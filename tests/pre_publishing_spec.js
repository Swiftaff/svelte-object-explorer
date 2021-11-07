const fs = require("fs");
const test = require("ava");

test("Bundles use terser", async (t) => {
    const dist_index_actual = fs.readFileSync("./dist/index.js", "utf8").substring(0, 52);
    const dist_index_mjs_actual = fs.readFileSync("./dist/index.mjs", "utf8").substring(0, 39);
    const dist_value_mjs_actual = fs.readFileSync("./dist/value.mjs", "utf8").substring(0, 39);

    const dist_index_expected = "var SvelteObjectExplorerCustomElementIIFE=function()";
    const dist_index_and_value_mjs_expected = "function t(){}function e(t){return t()}";

    t.deepEqual(dist_index_actual, dist_index_expected);
    t.deepEqual(dist_index_mjs_actual, dist_index_and_value_mjs_expected);
    t.deepEqual(dist_value_mjs_actual, dist_index_and_value_mjs_expected);
});

test("No '.only' cypress tests", async (t) => {
    const cypress_tests = fs.readFileSync("./cypress/integration/main_spec.js", "utf8").includes(".only");
    console.log("cypress_tests", cypress_tests);

    t.deepEqual(cypress_tests, false);
});
