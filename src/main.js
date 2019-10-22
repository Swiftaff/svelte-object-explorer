import App from "./example.svelte";

let smallTestObject = {
    test: 1,
    test2: "test2",
    test3: { test4: 4, test5: { test6: ["test6", "test7"] } }
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
    props: { testObject: { largeTestObject, largeTestObject2: largeTestObject }, top: true }
});

export default app;
