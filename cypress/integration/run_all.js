// test all example sites in series not parallel - for local testingonly not circleci
const test_suite = require("./main_spec.js");
for (let index = 0; index < 2; index++) {
    test_suite(index);
}
