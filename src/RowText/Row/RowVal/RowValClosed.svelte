<script>
    export let row;
</script>

{#if row && typeof row === "object"}<span class="val"
        >{#if row.type}{row.val.substring(0, row.val.length - row.bracket)}{:else}{row.val}{/if}</span
    >{/if}
