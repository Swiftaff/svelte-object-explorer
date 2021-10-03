# Svelte Object Explorer - "rows" override

You can override each row of the Svelte Object Explorer panel - with a "rows" setting, which is an array of one or more "row override" objects. These allow you to change or highlight a row when that rows 'match' function returns true for the rows value.

All matching overrides will be applied in order (except "html" where only the last will apply).

If none match, the default type handling applies.

```
// rows array with one or more row override objects...
rows: [
  { match, type, value, html, row_details },
]
```

-   `match` (function) to determine if this override should apply.

    -   Return `true` (or truthy) for Svelte Object Explorer to apply all the override functions you supply for `type`, `value`, `row_details` or `html`.

    -   Return `false` (or falsey) to skip this override.

Then if the above matches, apply these overrides...

-   `value` (function) to override the value into something else.
-   `type` (string) to override the default type name of the row.
-   `html` (function) to generate the entire html for the required output row in the panel, so you can fully customise it!
-   `row_details` (experimental) function to override the internal row details before they are rendered

## Usage

One or more of the row overrides can then be used in Svelte Object Explorer...

```
// App.svelte

<script>
  import SvelteObjectExplorer from 'svelte-object-explorer'

  // example value watching 2 properties
  let html = document.body; // can be any Node
  let staticObject1 = { test1: "test1" }
  let value = { html, staticObject1 }

  //row overrides, e.g. see examples below
  const example1 = {... see below ...};
  const example2 = {... see below ...};
  const rows: [ example1, example2 ];

</script>

<SvelteObjectExplorer {value} {rows} />
// ...
// the rest of your app
```

## Examples

The "rows" setting should contain one or more sub-objects for each 'match' parser, and each with one or more of the other optional override keys, e.g.

### Example 1: custom HTML row

if value = "valuecontainingabc"
output a div containing red text 'containsABC: valuecontainingabc'

```
const example1 =
{
  match: (value) => typeof value === "string" && value.includes("abc"),
  html: (row_settings, globals) => {
    return {
      ...row_settings,
      html: `<div class="test2"
      style="color:red">
      containsABC: ${row_settings.val}
      </div>`,
    };
  },
}
```

### Example 2: overriding the value of an existing 'String' Type

If the value is a String, always add a "!"

```
const example2 =
{
  match: (v) => typeof v === "string",
  value: (v) => v + "!",
},
```

### Example 3: simplifying an object

If the value is an object with particular keys, like...

```
{
  key1: "test1",
  key2: "test2",
  ...
  key10: "test10
}
```

...simplify it and display it as just "test1 (test10)"

```
const example3 = {
  match: (v) => (typeof v === "object" && "key1" in v && "key10" in v),
  value: (v) => `${v.key1} (${v.key10})`,
},
```

### Example 4: changing the type

If the value is an object with particular keys, like:

```
{
  key1: "test1",
  key2: "test2",
  ...
  key10: "test10
}
```

change the type to "my_type"

```
const example4 = {
  match: (v) => (typeof v === "object" && "key1" in v && "key10" in v),
  type: "my_type",
},
```

### Example 5: tweaking internal row_details, without changing html

Unlikely to be useful, and will probably break in future versions, but this is if you want to get into the ugly details, e.g.
if value = "valuecontainingabc"
remove the indent, change the key, output a div containing 'containsABC: valuecontainingabc' with type name "my_type"

```
const example5 =
{
  match: (value) => typeof value === "string" && value.includes("abc"),
  row_details: (current_row_details, globals) => {
    return {
      ...current_row_details,
      // update as many of the default settings as required
      // based on current row details or not...
      indent: (current_row_details.level + 5) * globals.indentSpaces,
      key: "mykey",
      val: `containsABC: ${current_row_details.val}`,
      type: "my_type",
    }
  }
}
```

where (e.g.)

-   key = "0: " // e.g. the index of an item in an array or object
-   val = "test" // the row value
-   type = "string" // the name of the type
-   indent = 4 // how many levels the row is indented. This is then multiplied by the global.indentSpaces value (2 spaces by default)
-   globals = { indentSpaces: 2 }; // only 1 global at the moment, a multiplier applied to each indent

### Example 6: an unnecessary row override

It has a match that applies to every row, but since it is missing any other override keys it will have no effect!

```
const example6 =
{ match: (v) => true }
```
