<script>
    export let row;
    export let isExpanded = false;
</script>

{#if row.type === "Tag"}
    {row.tag}
{:else}
    <span>
        {#if isExpanded}{row.output.substring(0, row.output.length - 1)}{:else}{row.output}{/if}
        {#if row.type}
            <span class="type">{row.type}</span>
        {/if}
        {#if row.len}
            <span class={"len" + (isExpanded ? " grey" : "")}>({row.len})</span>
        {/if}
    </span>
{/if}

<style>
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
    .grey {
        color: #666;
    }
</style>
