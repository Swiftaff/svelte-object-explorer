# Svelte Object Explorer - PLUGINS

You can override or extend some features of Svelte Object Explorer with an optional object of one or more parser objects, each with one or more override keys. This is then checked (and then applied if the parser matches) for every row of the output panel, allowing you to control output per value or value type.

## mandatory parser

-   `type_parser` a function to define this type based on the value being parsed.

    If the function returns `true` based on the value matching some criteria, Svelte Object Explorer will assume the value is of this type and will then apply all of the optional functions that you supply below for `name_of_type`, `transform`, `row_render` and `row_html`.

    If it returns `false` then Svelte Object Explorer will just skip it, and revert to handling the value based on the existing default types.

    If there are multiple matching parsers - only the first will be applied

## optional additional keys per parser

-   `name_of_type` the type name to appear in each explorer row. It can be your own new type name, or override an existing default type, e.g. 'MyCustomType' or 'String'. If it overrides, the following options also override.
-   `transform` a function to convert the supplied value into something else.
-   `row_render` a function to generate each required output row for this type within the panel, overriding the default. See `row_settings`
-   `row_html` a function to generate the entire html for the required output row in the panel, so you can fully customise it!

## Examples

The pluings object should contain one or more sub-objects, one for each parser, each with one or more of the other optional keys, e.g.

### Example 1: a new Custom Type

if value = "valuecontainingabc"
output a div containing 'containsABC: valuecontainingabc'
with type name "MyCustomType"

```
const example1 =
{
  name_of_type: "MyCustomType",
  type_parser: (value) => value.contains("abc"),
  row_html: (row_settings, globals) =>  {
    return {
      ...row_settings,
      html: "<div>containsABC:${row_settings.val}</div>"
    }
  }
}
```

### Example 2: overriding the existing 'String' Type

If the value is a String add a "!"

```
const example2 =
{
  name_of_type: "String",
  // same name as existing type

  type_parser: (v) => typeof v === "String",
  transform: (v) => v + "!",
},
```

### Example 3: simplifying an object

If the value is an object with particular keys, like:

```
{
  key1: "test1",
  key2: "test2",
  ...
  key10: "test10
}
```

simplify it and display it as just "test1 (test10)"

```
const example3 = {
  name_of_type: "MySimplifiedObject",
  type_parser: (v) =>
    (typeof v === "Object" &&
    key1 in v &&
    key10 in v),
  transform: (v) => `${v.key1} (${v.key10})`,
},
```

### Example 4: only updating row_settings not full row_html

If you want to get into the ugly details, feel free to use row_settings, e.g.
if value = "valuecontainingabc"
increase the indent, and a div containing 'containsABC: valuecontainingabc'
with type name "MyCustomType"

```
const example4 =
{
  name_of_type: "MyCustomType",
  type_parser: (value) => value.contains("abc"),
  row_render: (row_settings, globals) =>  {
    return {
      ...row_settings,
      value: "<div>containsABC:${row_settings.val}</div>"
    }
  }
}

/*
where e.g.

// only 1 global at the moment
globals = {
  indentSpaces: 2 // a multiplier applied to each indent
};

row_settings = {
  key: "0: ",
  // e.g. the row number in an array or object

  val: "test",
  // the row value

  level: "0.1.0.2"
  // parents of row in dot notation

  is_multiline: true,
  // for longer values

  is_first_multiline: false,
  // first line of a multiline value

  is_last_multiline: false,
  // last line of a multiline value

  type: "String",
  // the name of the type

  indent: (row_settings.indent + 2) * globals.indentSpaces,
  // how many spaces the row is indented
};
*/
```

### Example5: an unnecessary parser

Since it is missing any other keys it will have no effect!

```
const example5 =
{
  type_parser: (v) => v.contains("abc"),
}
```

### Usage

One or more of the parsers can then be used in Svelte Object Explorer...

```
// App.svelte
<script>
  import SvelteObjectExplorer from 'svelte-object-explorer'

  // example value watching 2 properties
  let html = document.body; // can be any Node
  let staticObject1 = { test1: "test1" }
  let value = { html, staticObject1 }

  //example plugins
  const example1 = {... see above ...};
  const example2 = {... see above ...};
  const plugins = { example1, example2 }

</script>

<SvelteObjectExplorer {value} {plugins} />
// ...
// the rest of your app
```
