// test the first example site - separate file for parallelisation in circleci
const { test_suite, example_urls, props_and_settings } = require("./main_spec.js");
const url = example_urls[0];
test_suite(url, props_and_settings);
