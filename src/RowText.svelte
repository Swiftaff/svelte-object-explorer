<script>
    export let row;
</script>

<span>
    {row.output}
    {#if row.type}
        <span class="type">{row.type}</span>
    {/if}
    {#if row.len}
        <span class="len">({row.len})</span>
    {/if}
</span>

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
</style>
