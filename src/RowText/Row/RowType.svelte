<script>
    export let row;
</script>

{#if row && typeof row === "object" && row.type && row.type !== "ARRAY+OBJECT" && row.type !== "ARRAY+SUB_ARRAY"}<span
        class="type">{row.type}</span
    >{/if}

<style>
    .type {
        color: green;
        position: absolute;
        top: 0px;
        right: 5px;
    }
</style>
