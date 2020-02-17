# Svelte Object Explorer

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/svelte-object-explorer?style=social&logo=github)](https://github.com/user/repo) [![CircleCI](https://circleci.com/gh/Swiftaff/svelte-object-explorer.svg?style=svg)](https://circleci.com/gh/Swiftaff/svelte-object-explorer) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Demo

https://svelte.dev/repl/2bb193c358c84ac0a5a76b546c860664?version=3.12.1

## Features

Provides a simple to use, quick a dirty (well, just plain ugly) panel showing whatever data you wish to temporarily view whilst you are developing your app.

Sure you can do this with `console.log({object})` or add breakpoints while debugging...

...but sometimes you just want to see how a value changes over time while using your app without chucking it into the view with `why won't my button toggle: {variable}`, or perhaps you forgot what shape the data is in from that API call or store variable.

Displays an unobtrusive toggle-able window, with one or multiple variables of most kinds of data: array, object, string, number, boolean, symbol

Manually expand/contract nested objects and arrays, or show all expanded, and hover to highlight elements of the same level.

## Installation

1. Create your svelte project
2. `npm install svelte-object-explorer --save-dev`

## Basic usage

Include **svelte-object-explorer** in the script section of any svelte file, but usually works best in your top level component so it's not hidden by other elements.

```
// App.svelte
<script>
  import SvelteObjectExplorer from 'svelte-object-explorer'
  let staticObject1 = { test1: "test1" }
  let staticObject2 = { test2: "test2" }
</script>

<SvelteObjectExplorer
 myStore = { staticObject1, staticObject2 }
 fade = {false} //optional, default true
 tabPosition = "top" //optional
 open = "dataFromProps" //optional
 rateLimit = {1000} //optional, default 100
 initialToggleState = {true} //optional, default true
/>
// ...
// the rest of your app
```

`myStore` can be any javaScript object of values that you want to track, e.g.

-   variables from your component
-   variables from component props
-   values from a store
-   outputs from a function...

`fade` is an optional boolean, which fades the panel when not hovered

`tabPosition` is an optional string, which affects the position of the "Show/Hide" tab.

-   "top" is default
-   "middle"
-   "bottom"

`open` is an optional string, the name of one of the objects you supplied in myStore, to auto-expand it on load

`rateLimit` is an optional integer, for the rate at which the view should update (to avoid it getting bogged down by very fast data updates. The default is 100 (milliseconds)

`initialToggleState` is an optional boolean, for whether the tab is open (true) or closed (false) on startup

> It's not clever, it's not pretty...

> ...it's strong and it's sudden, and it can be cruel sometimes but it might just save your life. That's the power of... `svelte-object-explorer` _(with apologies to Huey Lewis)_

## License

This project is licensed under the MIT License.
