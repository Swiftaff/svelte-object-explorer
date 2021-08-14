<script>
    export let width;
    export let is_adjusting_width;
    export let save_settings;

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
        let new_width = start_w + start_x - e.clientX;
        let new_width_is_within_limits = new_width > 440 && new_width < innerWidth - tabWidth;
        if (is_adjusting_width && new_width_is_within_limits) width = new_width;
    }
</script>

<svelte:window bind:innerWidth on:mousemove={mousemove} on:mouseup={drag_stop} />

<div class="width_adjust" style={"right: " + (width + 5) + "px;"} on:mousedown={drag_start}>
    <div class="width_adjust_inner">
        <div class="width_adjust_inner2" />
    </div>
</div>
<div class="width_adjust_underlay" style={is_adjusting_width ? "visibility:visible" : "visibility:hidden"} />

<style>
    .width_adjust,
    .width_adjust_inner,
    .width_adjust_inner2 {
        width: 10px;
        height: 100vh;
        position: absolute;
        top: 0;
        z-index: 1000000020;
        pointer-events: all;
        cursor: ew-resize;
        user-select: none;
        -moz-user-select: none;
    }

    .width_adjust_inner {
        width: 6px;
        right: 2px;
    }

    .width_adjust_inner2 {
        width: 3px;
        right: 2px;
    }

    .width_adjust:hover:not(:active) .width_adjust_inner {
        background-color: blue;
        transition: background-color 400ms linear;
    }

    .width_adjust:active .width_adjust_inner2 {
        background-color: black;
        transition: background-color 0ms linear;
    }

    .width_adjust_underlay {
        width: 100vw;
        height: 100vh;
        z-index: 1000000010;
        position: absolute;
    }
</style>
