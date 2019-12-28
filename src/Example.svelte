<script>
  import SvelteObjectExplorer from "./Index.svelte";
  import { count } from "./ExampleCustomStore.js";
  let counter = 1;
  let array = [
    { first: "Bob", surname: "Marley" },
    { first: "John", surname: "Lennon" },
    { first: "The Chuckle", surname: "Brothers" }
  ];

  function incr() {
    setInterval(() => {
      counter++;
    }, 100);
  }

  incr();

  let myStore;

  $: myStore = {
    variousTypes: {
      boolean: true,
      string: "test",
      number: 123,
      array: ["test1", "test2"],
      object: { test1: "test1", test2: "test2" },
      arrowfunction: () => {},
      function: function test() {
        console.log("test");
      },
      symbol: Symbol(),
      null: null,
      undefined: typeof bananaman
    },
    SvelteVariable: counter,
    customStore: count,
    customStoreValue: $count
  };

  let string = "< SvelteObjectExplorer {myStore} />";
</script>

<SvelteObjectExplorer
  {myStore}
  open="variousTypes"
  fade={true}
  tabPosition="middle"
  rateLimit={2000} />

<h1>Svelte Object Explorer</h1>
<p>
  {@html string}
</p>
<p>
  Provides a simple to use, quick a dirty hideable list of whatever data you
  wish to temporarily view whilst you are developing your app, rather than
  console.logging or debugging.
</p>
<p>
  Displays most kinds of data: array, object, string, number, boolean, symbol
</p>

<h2>Autocounter from component state: {counter}</h2>

<h2>Manual counter from custom store: {$count}</h2>

<button id="decr" on:click={count.decrement}>-</button>
<button id="incr" on:click={count.increment}>+</button>
<button id="reset" on:click={count.reset}>reset</button>
