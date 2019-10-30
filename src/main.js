import App from "./Example.svelte";

let smallTestObject = {
    test: 1,
    test2: "test2",
    test3: { test4: 4, test5: { test6: ["test6", "test7"] } }
};

let mediumTestObject = {
    test1: 1,
    test2: "2",
    test3: {
        test4: "test4"
    },
    test: [smallTestObject, smallTestObject, smallTestObject, smallTestObject, smallTestObject]
};

let largeTestObject = {
    test: [
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject,
        smallTestObject
    ]
};

const app = new App({
    target: document.body,
    props: { testObject: { mediumTestObject, largeTestObject }, top: true }
});

export default app;
