// test all example sites in series not parallel - for local testingonly not circleci
const { test_suite, example_urls, props_and_settings } = require("./main_spec.js");
for (let index = 0; index < 2; index++) {
    //skip svelte - basically the same as es version
    const url = example_urls[index];
    test_suite(url, props_and_settings);
}
