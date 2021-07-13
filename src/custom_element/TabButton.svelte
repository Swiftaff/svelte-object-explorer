<svelte:options tag="svelte-object-explorer-tab-button" />

<script>
    import icons from "./icons.js";
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
            {@html icons["fluent:chevron-down-12-filled"]}
        </span>
    {:else}
        Show
        <span class="smaller">
            {@html icons["fluent:chevron-up-12-filled"]}
        </span>
    {/if}
</div>
