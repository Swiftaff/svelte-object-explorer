# Svelte Object Explorer

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/svelte-object-explorer?style=social&logo=github)](https://github.com/user/repo) [![CircleCI](https://circleci.com/gh/Swiftaff/svelte-object-explorer.svg?style=svg)](https://circleci.com/gh/Swiftaff/svelte-object-explorer) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Demo

https://svelte.dev/repl/2bb193c358c84ac0a5a76b546c860664?version=3.12.1

## Features

Provides a simple to use, quick a dirty (well, just plain ugly) panel showing whatever data you wish to temporarily view whilst you are developing your app.

Sure you can do this with `console.log({object})` or add breakpoints while debugging...

...but sometimes you just want to see how a value changes over time while using your app without chucking it into the view with `why won't my button toggle: {variable}`, or perhaps you forgot what shape the data is in from that API call or store variable.

Displays an unobtrusive toggle-able window, with one or multiple variables of most kinds of data:

-   string
-   number - not including bigint
-   boolean
-   null
-   undefined
-   object
-   array - long arrays are chunked for easier navigation
-   symbol
-   function
-   HTML - simplified nested hierarchy of HTML tags and text based on a supplied Node _NEW in v2_

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

  // example value watching 2 properties
  let html = document.body; // can be any Node
  let staticObject1 = { test1: "test1" }
  let value = { html, staticObject1 }
</script>

<SvelteObjectExplorer {value} />
// ...
// the rest of your app
```

## Options

`value` can be any javaScript object of values that you want to track, e.g. `(Default = document.body)`

-   variables from your component
-   variables from component props
-   values from a store
-   any DOM node, e.g. document.body
-   outputs from a function...

`fade` is an optional boolean, which fades the panel when not hovered. `(Default = false)`

`tabposition` is an optional string, which affects the position of the "Show/Hide" tab.

-   "top" `(Default)`
-   "middle"
-   "bottom"

`open` is an optional string, the name of one of the objects you supplied in myStore, to auto-expand it on load `(Default = null)`

`ratelimit` is an optional integer, for the rate at which the view should update (to avoid it getting bogged down by very fast data updates. `(Default = 100 [milliseconds])`

`initialtogglestate` is an optional boolean, for whether the tab is open (true) or closed (false) on startup. `(Default = false)`

`row_expander` a function to identify a dom element, e.g. by it's nodeName. This defines a dom element which can then be used to expand the panel at the parent of this element wherever you manually add it in your code, providing a simple way to expand a piece of your code in the panel. It can be any valid html tag, even a custom made-up tag
e.g. (element) => element.nodeName === "HTML-NAME-OF-ELEMENT"
`(Default = "SVELTE-EXPLORER-EXPAND" since default tag is <svelte-explorer-expand />)`
TODO - check this is true

Also see [extensions](EXTENSIONS.md) for how to further extend Svelte Object Explorer - to override or extend the default list of data types or rendering within the panel. `(Default = {})`

-   TODO make this a root option
-   TODO make all options available as a single options object
-   TODO change options to lowercase
-   TODO change from plugins to extensions

## new in v2.2

-   resizable window width - and saves to localStorage to re-use between sessions
-   row_expander
-   extensions

## New in v2.1

-   changes to some of the option names above
-   mostly refactored code
-   no external dependencies (except dev dependencies)
-   now includes basic dom node parsing
-   3 ways to use it

    1.  use the Svelte Component version as above - but this can sometimes mean some style clashes with your app, so...
    1.  ...you can use the custom element ES module version instead which sandboxes styles in its shadowRoot.

        -   replace import from above

        ```
        /* import SvelteObjectExplorer from 'svelte-object-explorer' */
        import SvelteObjectExplorer from 'svelte-object-explorer/dist/index.mjs'
        ```

        -   replace svelte element with custom element

        ```
        <!--SvelteObjectExplorer {value} /-->
        <svelte-object-explorer {value} />
        ```

    1.  ...or you can skip including it in your svelte app code at all, and just include the custom element IIFE file in your index.html instead. This will automatically mount the Custom Element version to the `body`. This should mean you can use it with any vanilla front-end javaScript or other frameworks like React or Vue.

        -   See example `index.html` in this repo's public directory at `/public/VanillaAndIIFE` which imports the copy `iife_copy.js` of the `dist/index.js` (note .js not .mjs)
        -   In this case you need to pass the options above as a global `svelteobjectexplorer` window object instead, see example JS in the index.html above, e.g.

        ```
        let value = "whatever you're watching";
        //...assign other options if needed
        window.svelteobjectexplorer = { value, open, fade, tabposition, ratelimit }
        ```

> It's not clever, it's not pretty...

> ...it's strong and it's sudden, and it can be cruel sometimes but it might just save your life. That's the power of... `svelte-object-explorer` _(with apologies to Huey Lewis)_

## License

This project is licensed under the MIT License.
