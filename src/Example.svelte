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
    }, 1000);
  }

  incr();

  let myStore;

  $: myStore = {
    arrays: array,
    componentStateVariable: counter,
    customStore: count,
    customStoreValue: $count,
    hardCodedValues: { test2: "test" }
  };

  let string = "< SvelteObjectExplorer {myStore} />";
</script>

<SvelteObjectExplorer {myStore} />

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

<button on:click={count.decrement}>-</button>
<button on:click={count.increment}>+</button>
<button on:click={count.reset}>reset</button>
