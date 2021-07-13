<svelte:options tag="svelte-object-explorer-chevron-buttons" />

<script>
    //import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
    //import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    export let row;
    export let rowsToShow;
    export let rowContract;
    export let rowExpand;
</script>

{#if row}
    {#if row.expandable}
        {#if rowsToShow.includes(row.indexRef)}
            <span class="smallest dataArrow" on:mousedown={() => rowContract(row.indexRef)}>
                {@html "v"}<!--FaChevronDown /-->
            </span>
        {:else}
            <span class="smallest dataArrow" on:mousedown={() => rowExpand(row.indexRef)}>
                {@html ">"}<!--FaChevronRight /-->
            </span>
        {/if}
    {/if}
{/if}
