<script>
    import Quote from "./Quote.svelte";
    export let row;
</script>

{#if row && typeof row === "object"}<Quote {row} first_or_last_multiline={row.is_first_multiline} /><span class="val"
        >{row.val}</span
    ><Quote {row} first_or_last_multiline={row.is_last_multiline} />{/if}

<style>
    .val {
        color: black;
    }
</style>
