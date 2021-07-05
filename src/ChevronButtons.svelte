<script>
    import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    export let row;
    export let rowsToShow;
    export let rowContract;
    export let rowExpand;
</script>

{#if row.expandable}
    {#if rowsToShow.includes(row.indexRef)}
        <span class="smallest dataArrow" on:mousedown={() => rowContract(row.indexRef)}>
            <FaChevronDown />
        </span>
    {:else}
        <span class="smallest dataArrow" on:mousedown={() => rowExpand(row.indexRef)}>
            <FaChevronRight />
        </span>
    {/if}
{/if}

<style>
    .smallest {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 2px;
        color: green;
    }
    .dataArrow {
        position: absolute;
        left: 0px;
        cursor: pointer;
    }

    .dataArrow:hover {
        color: black;
    }
</style>
