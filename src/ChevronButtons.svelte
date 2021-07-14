<script>
    import icons from "./icons.js";
    export let row;
    export let rowsToShow;
    export let rowContract;
    export let rowExpand;
</script>

{#if row}
    {#if row.expandable}
        {#if rowsToShow.includes(row.indexRef)}
            <span class="smallest white dataArrow" on:mousedown={() => rowContract(row.indexRef)}>
                {@html icons["fluent:chevron-down-12-filled"]}
            </span>
        {:else}
            <span class="smallest dataArrow" on:mousedown={() => rowExpand(row.indexRef)}>
                {@html icons["fluent:chevron-right-12-filled"]}
            </span>
        {/if}
    {/if}
{/if}

<style>
    .smallest {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 1px;
        left: 0px !important;
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

    .white {
        color: white;
    }
</style>
