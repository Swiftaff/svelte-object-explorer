<script>
    import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";

    export let topLevelObject;
    export let topLevelObject_index;
    export let openIndex;
    export let click;
</script>

<tr
    class={topLevelObject.class + (openIndex === topLevelObject_index ? " open" : "")}
    on:mousedown={() => click(topLevelObject_index, topLevelObject.val, topLevelObject.type)}
>
    <td class="link">
        {#if topLevelObject.class}
            <span class="smaller">
                {#if openIndex === topLevelObject_index}<FaChevronDown />{:else}<FaChevronRight />{/if}
            </span>
        {/if}
        {topLevelObject.valType}
    </td>
    <td>{topLevelObject.type}</td>
    <td>{topLevelObject.key}</td>
</tr>

<style>
    .accordion {
        background-color: #666 !important;
        color: white;
    }
    .link {
        cursor: pointer;
    }

    .link:hover {
        background-color: #888;
    }
    .smaller {
        width: 15px;
        height: 15px;
        display: inline-block;
        position: relative;
        top: 2px;
    }
</style>
