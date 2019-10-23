# Svelte Object Explorer

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/svelte-object-explorer?style=social&logo=github)](https://github.com/user/repo) [![Build Status](https://travis-ci.org/Swiftaff/svelte-object-explorer.svg?branch=master)](https://travis-ci.org/Swiftaff/svelte-object-explorer) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Demo

https://svelte.dev/repl/2bb193c358c84ac0a5a76b546c860664?version=3.12.1

## Features

Provides a simple to use, quick a dirty (well, just plain ugly) panel showing whatever data you wish to temporarily view whilst you are developing your app.

Sure you can do this with `console.log({object})` or add breakpoints while debugging...

...but sometimes you just want to see how a value changes over time while using your app without chucking it into the view with `why won't my button toggle: {variable}`, or perhaps you forgot what shape the data is in from that API call or store variable.

Displays an unobtrusive toggle-able window, with one or multiple variables of most kinds of data: array, object, string, number, boolean, symbol

## Installation

1. Create your svelte project
2. `npm install svelte-object-explorer --save-dev`

## Basic usage

Include **svelte-object-explorer** in the script section of any svelte file, but usually works best in your top level component so it's not hidden by other elements.

```
// App.svelte
<script>
  import SvelteObjectExplorer from 'svelte-object-explorer'
  let staticObject = { test: "test" }
  export let dataFromProps;
</script>

<SvelteObjectExplorer
 myStore = { staticObject, dataFromProps }
/>
// ...
// the rest of your app
```

`myStore` can be any javaScript object of values that you want to track, e.g.

-   variables from your component
-   variables from component props
-   values from a store
-   outputs from a function...

> It's not clever, it's not pretty...

> ...it's strong and it's sudden, and it can be cruel sometimes but it might just save your life. That's the power of... `svelte-object-explorer` _(with apologies to Huey Lewis)_

## License

This project is licensed under the MIT License.
