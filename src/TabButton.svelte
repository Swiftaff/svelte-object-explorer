<script>
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";
    export let toggle;
    export let tabPosition;
    export let fade;
    export let hovering;
    export let doToggle;
</script>

<div
    class={(toggle ? "toggle toggleShow" : "toggle toggleHide") +
        " toggle" +
        tabPosition +
        (fade ? (hovering ? " noFade" : " fade") : " noFade")}
    on:mousedown={doToggle}
>
    {#if toggle}
        Hide
        <span class="smaller">
            <FaChevronDown />
        </span>
    {:else}
        Show
        <span class="smaller">
            <FaChevronUp />
        </span>
    {/if}
</div>

<style>
    .svelte-object-explorer-wrapper {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100vw;
        height: 100vh;
        padding: 0px;
        margin: 0px;
        z-index: 100000000000000000 !important;
        pointer-events: none;
        font-family: "Roboto", "Arial", sans-serif !important;
    }

    .fade {
        opacity: 0.3 !important;
    }

    .noFade {
        opacity: 1 !important;
    }

    .tree {
        pointer-events: all;
        transition: 0.2s;
        position: fixed;
        right: 0px;
        top: 0px;
        width: 500px;
        height: 100vh;
        background-color: #aaa;
        z-index: 10000000;
        overflow: auto;
        font-size: small;

        margin: 0;
        font-size: 14px;
        line-height: 1.3em;

        -webkit-box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
        -moz-box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
        box-shadow: -4px 4px 10px 0px rgba(0, 0, 0, 0.15);
    }

    .tree-hide {
        right: -500px;
        transition: 0.2s;
    }

    .tree table {
        table-layout: fixed;
        width: 480px;
    }

    .tree tr:nth-child(odd) {
        background-color: #ccc;
    }

    .treeVal {
        min-height: 10px;
        overflow-wrap: break-word;
        max-width: 480px;
        overflow: auto;
        background-color: #666 !important;
        color: white;
    }

    .toggle:hover {
        pointer-events: all;
        opacity: 1;
    }

    .toggle {
        pointer-events: all;
        cursor: pointer;
        position: fixed;
        width: 70px;
        height: 20px;
        text-align: center;
        transform: rotate(-90deg);
        background-color: #aaa;
        z-index: 10000000;

        margin: 0;
        font-size: 14px;
        line-height: 1.3em;
    }

    .toggletop {
        top: 25px;
    }

    .togglemiddle {
        top: calc(50vh - 25px);
    }

    .togglebottom {
        bottom: 25px;
    }

    .toggleShow {
        pointer-events: all;
        transition: 0.2s;
        right: 475px;
    }

    .toggleHide {
        pointer-events: all;
        transition: 0.2s;
        right: -25px;
    }

    .accordion {
        background-color: #666 !important;
        color: white;
    }

    pre {
        margin: 0px;
        white-space: normal;
        padding: 0px;
    }

    .icon1 {
        width: 15px;
        height: 15px;
    }

    .smaller {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 2px;
    }

    .smallest {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 2px;
        color: green;
    }

    .link {
        cursor: pointer;
    }

    .link:hover {
        background-color: #888;
    }

    .row {
        background-color: #999;
        position: relative;
        padding-left: 15px;
        display: block;
        white-space: pre;
        height: 1.5em;
    }

    .row:nth-child(even) {
        background-color: #aaa;
    }

    .dataArrow {
        position: absolute;
        left: 0px;
        cursor: pointer;
    }

    .dataArrow:hover {
        color: black;
    }

    .len {
        color: black;
        position: absolute;
        right: 70px;
        top: 0px;
    }

    .type {
        color: green;
        position: absolute;
        top: 0px;
        right: 5px;
    }

    .nopointer {
        cursor: pointer;
        user-select: none;
    }

    .hoverRow {
        background-color: #68f !important;
    }

    .toggleShowAll,
    .copyToClipbord {
        display: inline;
    }

    #hiddenClipboard {
        position: absolute;
        left: -9999px;
    }

    .tree button {
        position: absolute;
        top: 3px;
        right: 3px;
    }
</style>
