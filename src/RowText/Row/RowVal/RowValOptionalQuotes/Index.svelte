<script>
    import Quote from "./Quote.svelte";
    export let row;
</script>

<Quote {row} first_or_last_multiline={row.is_first_multiline} /><span class="val">{row.val}</span><Quote
    {row}
    first_or_last_multiline={row.is_last_multiline}
/>

<style>
    .val {
        color: black;
    }
</style>
