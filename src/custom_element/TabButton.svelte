<svelte:options tag="svelte-object-explorer-tab-button" />

<script>
    //import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    //import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";
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
            {@html "v"}<!--FaChevronDown /-->
        </span>
    {:else}
        Show
        <span class="smaller">
            {@html "^"}<!--FaChevronUp /-->
        </span>
    {/if}
</div>
