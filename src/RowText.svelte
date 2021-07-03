<script>
    export let row;
    export let isExpanded = false;
</script>

{#if row.type === "Tag"}
    {row.tag}
{:else}
    <span>
        {#if isExpanded}{row.output.substring(0, row.output.length - row.bracket)}{:else}{row.output}{/if}
        {#if row.type && row.type !== "ARRAY+OBJECT" && row.type !== "ARRAY+SUB_ARRAY" && !row.output.includes("long arrays are chunked")}
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
