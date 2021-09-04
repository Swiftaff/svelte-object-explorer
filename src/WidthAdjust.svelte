<script>
    import { beforeUpdate, afterUpdate } from "svelte";

    export let width;
    export let is_adjusting_width;
    export let save_settings;
    export let panel;

    let left = 0;
    let start_x = 0;
    let start_w = width;
    let tabWidth = 30;
    let innerWidth = 0;

    function drag_start(e) {
        is_adjusting_width = true;
        start_x = e.clientX;
        start_w = width;
    }
    function drag_stop() {
        is_adjusting_width = false;
        save_settings();
    }

    function mousemove(e) {
        if (is_adjusting_width) {
            let new_width = start_w + start_x - e.clientX;
            let new_width_is_within_limits = new_width > 440 && new_width < innerWidth - tabWidth;
            if (new_width_is_within_limits) width = new_width;
        }
    }

    beforeUpdate(() => {
        if (panel) left = panel.getBoundingClientRect().left;
    });
</script>

<svelte:window bind:innerWidth on:mousemove={mousemove} on:mouseup={drag_stop} />

<div class="width_adjust_hover_zone" style={"left:" + (left - 5) + "px"} on:mousedown={drag_start}>
    <div class="width_adjust_highlight" />
</div>

<style>
    .width_adjust_hover_zone,
    .width_adjust_highlight {
        width: 10px;
        height: 100vh;
        position: absolute;
        z-index: 1000000020;
        pointer-events: all;
        cursor: ew-resize;
        user-select: none;
        -moz-user-select: none;
    }

    .width_adjust_hover_zone:hover:not(:active) .width_adjust_highlight {
        background-color: blue;
        transition: background-color 200ms linear;
        width: 6px;
        left: 2px;
    }

    .width_adjust_hover_zone:active .width_adjust_highlight {
        background-color: black;
        transition: background-color 200ms linear;
        width: 2px;
        left: 4px;
    }
</style>
