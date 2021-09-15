<script>
    export let row;
    export let isExpanded = false;
</script>

{#if row}
    {#if row.html}
        {#if isExpanded}{#if row.expandable}{@html row.expandable}{:else}{@html row.html}{/if}{:else}{@html row.html}{/if}
    {:else if typeof row.val !== "undefined"}
        <span
            >{#if isExpanded}{" ".repeat(row.indent)}{#if "key" in row && row.key !== ""}<span class="key"
                        >{row.key}</span
                    >:
                {/if}
                <span class="val">{row.val.substring(0, row.val.length - row.bracket)}</span>
            {:else}{" ".repeat(row.indent)}{#if "key" in row && row.key !== ""}<span class="key">{row.key}</span>: {/if}
                {#if (!row.is_multiline || (row.is_multiline && row.is_first_multiline)) && (row.type === "string" || row.format_type === "string")}<span
                        class="white">"</span
                    >{/if}<span class="val">{row.val}</span
                >{#if (!row.is_multiline || (row.is_multiline && row.is_last_multiline)) && (row.type === "string" || row.format_type === "string")}<span
                        class="white">"</span
                    >{/if}{/if}
            {#if row.type && row.type !== "ARRAY+OBJECT" && row.type !== "ARRAY+SUB_ARRAY"}
                <span class="type">{row.type}</span>
            {/if}
            {#if row.len}
                <span class={"len" + (isExpanded ? " grey" : "")}>({row.len})</span>
            {/if}
        </span>
    {/if}
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
    .white {
        color: white;
    }
    .val {
        color: black;
    }
</style>
