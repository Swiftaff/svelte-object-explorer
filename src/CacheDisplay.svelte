<script>
    export let cache;
    export let ratelimit;
    export let ratelimitDefault;
</script>

{#if cache && cache.dataChanges && cache.viewChanges && cache.formatted}
    Data Changes(<span class="cache_data">{cache.dataChanges}</span>) View Changes(<span class="cache_view"
        >{cache.viewChanges}</span
    >) {#if ratelimit !== ratelimitDefault} Rate Limited: <span class="cache_ratelimit">{ratelimit}</span>ms{/if}
    <br />
    Last Updated(<span class="cache_last">{cache.formatted}</span>){/if}
