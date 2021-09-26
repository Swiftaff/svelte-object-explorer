<script>
    export let row;
</script>

<span class="val"
    >{#if row.type}{row.val.substring(0, row.val.length - row.bracket)}{:else}{row.val}{/if}</span
>
