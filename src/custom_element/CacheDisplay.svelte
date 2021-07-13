<svelte:options tag="svelte-object-explorer-cache-display" />

<script>
    export let cache;
    export let rateLimit;
    export let rateLimitDefault;
</script>

{#if cache && cache.dataChanges && cache.viewChanges && cache.formatted}
    Data Changes(<span class="cache_data">{cache.dataChanges}</span>) View Changes(<span class="cache_view"
        >{cache.viewChanges}</span
    >) {#if rateLimit !== rateLimitDefault} Rate Limited: <span class="cache_ratelimit">{rateLimit}</span>ms{/if}
    <br />
    Last Updated(<span class="cache_last">{cache.formatted}</span>){/if}
