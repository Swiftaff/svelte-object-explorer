import App from "./example.svelte";

let testObject = {
    test: 1,
    test2: "test2",
    test3: { test4: 4, test5: { test6: ["test6", "test7"] } }
};

const app = new App({
    target: document.body,
    props: { testObject }
});

export default app;
