<script>
    import { count } from "./ExampleCustomStore.js";
    import example_rows from "./ExampleRows.js";
    import settingsFixtures from "./ExampleSettings.js";

    export let sendprops = () => {};

    let thisPage;
    let counter = 1;
    let array = [
        { first: "Bob", surname: "Marley" },
        { first: "John", surname: "Lennon" },
        { first: "The Chuckle", surname: "Brothers" },
    ];
    let value = {};
    let params = new URL(document.location).searchParams;
    let open = params.get("open");
    let fade = params.get("fade");
    let tabposition = params.get("tabposition");
    let ratelimit = params.get("rateLimit");
    let settingsTest = params.get("settingsTest");
    let rows = example_rows;
    let promise;
    let loop;
    let animate = false;
    let startstop_text = "start";
    let string = "< SvelteObjectExplorer {myStore} />";
    $: if (thisPage) update_value();

    function update_value() {
        value = {
            html: thisPage,
            string1: "testy",
            longstring:
                "Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.",
            array,
            array2: [[["test1", "test2"], "test2"], "test2"],
            longarray: new Array(101).fill("x").map((x, i) => "" + i),
            object: {
                test1: {
                    test1: { test1: { test1: "test1", test2: "test2" }, test2: "test2" },
                    test2: "test2",
                },
                test2: "test2",
            },
            number1: 123,
            number2: 123.456789,
            //number3: 9007199254740992n * 2,
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
            pluginTest1a: {
                name: "custom_object1",
                specific_key1: "test1",
                value_key_a: "abc",
            },
            pluginTest1b: {
                name: "custom_object1",
                specific_key1: "test1",
                value_key_a: "abc",
                value_key_b: "123",
            },
            pluginTest2: "string: starts with string",
            pluginTest3: {
                name: "custom_object2",
                specific_key2: "test2",
                value_key_b: "ABC",
                value_key_c: 2,
            },
            pluginTest4: {
                name: "custom_object2",
                specific_key2: "test2",
                value_key_b: "ABC",
                value_key_c: 2,
                value_key_d: Symbol("test"),
            },
        };
        const settings = getSettings();
        const props = { value, open, fade, tabposition, ratelimit, rows, settings };
        sendprops(props);
    }

    function getSettings() {
        let settings = null;
        if (settingsTest && settingsFixtures[settingsTest]) {
            settings = settingsFixtures[settingsTest];
        }
        return settings;
    }

    async function getAsyncTimer() {
        const res = await timeout(3000);
        if (res) {
            return "async timer done";
        } else {
            throw new Error("async error");
        }
    }

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(() => resolve("success"), ms));
    }

    function handleAsyncTimerClick() {
        promise = getAsyncTimer();
    }

    function startstop_toggle() {
        animate = !animate;
        startstop_text = animate ? "stop" : "start";
        if (animate) {
            promise = getAsyncTimer();
            loop = setInterval(() => {
                counter++;
                update_value();
                const settings = getSettings();
                const props = { value, open, fade, tabposition, ratelimit, rows, settings };
                sendprops(props);
                window.svelteobjectexplorer = props;
            }, 1000);
        } else clearInterval(loop);
    }

    function count_decr() {
        count.decrement();
        update_value();
    }

    function count_incr() {
        count.increment();
        update_value();
    }

    function count_reset() {
        count.reset();
        update_value();
    }
</script>

<div bind:this={thisPage}>
    <h1>Svelte Object Explorer</h1>
    <button class="startstop" on:mouseup={startstop_toggle}>{startstop_text}</button>
    <p>
        {@html string}
    </p>
    <p>
        Provides a simple to use, quick a dirty hideable list of whatever data you wish to temporarily view whilst you
        are developing your app, rather than console.logging or debugging.
    </p>
    <span data-svelte-explorer-tag="#component:src/App.svelte" />
    <div>
        level 1
        <span data-svelte-explorer-tag="#if counter % 2">
            {#if counter % 2}
                <span>
                    level 2
                    <span>level 3 </span>
                </span>
                <span data-svelte-explorer-tag=":else" />
            {:else}
                <span data-svelte-explorer-tag=":else" />
                <span>
                    level 4
                    <span>
                        level 5 <span>level 6</span>
                    </span>
                </span>
            {/if}
        </span>
        <div>
            <span data-svelte-explorer-tag="#each array as person">
                {#each array as person}
                    <span>{person.first} {person.surname}</span>,
                {/each}
            </span>
        </div>
        <div>
            <button on:click={handleAsyncTimerClick}> Trigger Async Timer again </button>
            <span data-svelte-explorer-tag="#await promise">
                {#await promise}
                    <p>...waiting</p>
                    <span data-svelte-explorer-tag=":then message" />
                    <span data-svelte-explorer-tag=":catch error" />
                {:then message}
                    <span data-svelte-explorer-tag=":then message" />
                    <p>Async Timer Message is '{message}'</p>
                    <span data-svelte-explorer-tag=":catch error" />
                {:catch error}
                    <span data-svelte-explorer-tag=":catch error" />
                    <p style="color: red">{error.message}</p>
                {/await}
            </span>
        </div>
    </div>
    <span data-svelte-explorer-tag="/component:src/App.svelte" />

    <p>Displays most kinds of data: array, object, string, number, boolean, symbol</p>

    <h2>Autocounter from component state: {counter}</h2>

    <h2>Manual counter from custom store: {$count}</h2>

    <button id="decr" on:click={count_decr}>-</button>
    <button id="incr" on:click={count_incr}>+</button>
    <button id="reset" on:click={count_reset}>reset</button>
</div>
