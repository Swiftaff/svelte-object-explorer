<script>
    import icons from "./icons.js";
    export let toggle;
    export let tabposition;
    export let fade;
    export let hovering;
    export let doToggle;
    export let width = 475;
    export let is_adjusting_width;
</script>

<div
    class={(toggle ? "toggle toggleShow" : "toggle toggleHide") +
        " toggle" +
        tabposition +
        (fade ? (hovering ? " noFade" : " fade") : " noFade")}
    style={(toggle ? "right: " + (width - 25) + "px;" : "") + (is_adjusting_width ? "" : "transition: 0.2s")}
    on:mousedown={doToggle}
>
    {#if toggle}
        Hide
        <span class="smaller">
            {@html icons["fluent:chevron-down-12-filled"]}
        </span>
    {:else}
        Show
        <span class="smaller">
            {@html icons["fluent:chevron-up-12-filled"]}
        </span>
    {/if}
</div>

<style>
    .fade {
        opacity: 0.3 !important;
    }

    .noFade {
        opacity: 1 !important;
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
    }

    .toggleHide {
        pointer-events: all;
        right: -25px;
    }

    .smaller {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 2px;
    }
</style>
