<script>
    import SvelteObjectExplorer from "./Index.svelte";
    import { count } from "./ExampleCustomStore.js";
    let thisPage;
    let counter = 1;
    let array = [
        { first: "Bob", surname: "Marley" },
        { first: "John", surname: "Lennon" },
        { first: "The Chuckle", surname: "Brothers" },
    ];

    function incr() {
        setInterval(() => {
            counter++;
        }, 1000);
    }

    incr();
    const longarray = new Array(101).fill("x").map((x, i) => "" + i);
    let myStore;
    $: if (counter || $count) {
        myStore = {
            html: thisPage,
            string1: "testy",
            string2: "testy",
            array,
            array2: [[["test1", "test2"], "test2"], "test2"],
            longarray,
            object: {
                test1: {
                    test1: { test1: { test1: "test1", test2: "test2" }, test2: "test2" },
                    test2: "test2",
                },
                test2: "test2",
            },
            number1: 123,
            number2: 123.456789,
            boolean1: true,
            boolean2: false,
            null: null,
            undefined: undefined,
            symbol1: Symbol(),
            symbol2: Symbol("foo"),
            arrowfunction: () => {},
            arrowfunction2: (a, b, c, d) => {
                console.log("long, long, long, long comment test");
                arrowfunction();
            },
            function: function test(a, b, c, d) {
                console.log("test");
            },
            deep: {
                deep: {
                    deep: {
                        deep: {
                            deep: {
                                arrowfunction2: (a, b, c, d) => {
                                    console.log("long, long, long, long comment test");
                                    arrowfunction();
                                },
                            },
                        },
                    },
                },
                SvelteVariable: counter,
            },
            SvelteVariable: counter,
            customStore: count,
            customStoreValue: $count,
        };
    }
    let params = new URL(document.location).searchParams;
    let open = params.get("open");
    let fade = params.get("fade");
    let tabPosition = params.get("tabPosition");
    let rateLimit = params.get("rateLimit");

    let string = "< SvelteObjectExplorer {myStore} />";
</script>

<SvelteObjectExplorer {myStore} {open} {fade} {tabPosition} {rateLimit} />

<div bind:this={thisPage}>
    <h1>Svelte Object Explorer</h1>

    <p>
        {@html string}
    </p>
    <p>
        Provides a simple to use, quick a dirty hideable list of whatever data you wish to temporarily view whilst you
        are developing your app, rather than console.logging or debugging.
        <span>level 1<span>level 2<span>level 3</span></span></span>
    </p>
    <p>Displays most kinds of data: array, object, string, number, boolean, symbol</p>

    <h2>Autocounter from component state: {counter}</h2>

    <h2>Manual counter from custom store: {$count}</h2>

    <button id="decr" on:click={count.decrement}>-</button>
    <button id="incr" on:click={count.increment}>+</button>
    <button id="reset" on:click={count.reset}>reset</button>
</div>
