<script>
    export let row;
    export let first_or_last_multiline;
</script>

{#if (!row.is_multiline || (row.is_multiline && first_or_last_multiline)) && (row.type === "string" || row.format_type === "string")}<span
        class="white">"</span
    >{/if}

<style>
    .white {
        color: white;
    }
</style>
