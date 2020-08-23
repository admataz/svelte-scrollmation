<script context="module">
    export const toHomeRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) =>
        (homeScrollPos - scrollPosPx) / (homeScrollPos - startScrollPosPx);

    export const toStartRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) =>
        (scrollPosPx - startScrollPosPx) / (homeScrollPos - startScrollPosPx);

    export const toEndRatio = ({ scrollPosPx, endScrollPosPx, homeScrollPos }) =>
        (scrollPosPx - endScrollPosPx) / (homeScrollPos - endScrollPosPx);

    export const toRangeRatio = ({ scrollPosPx, endScrollPosPx, startScrollPosPx }) =>
        (scrollPosPx - endScrollPosPx) / (startScrollPosPx - endScrollPosPx);

    export const fullRangePx = ({ endScrollPosPx, startScrollPosPx }) =>
        endScrollPosPx - startScrollPosPx;

    export const toHomePx = ({ homeScrollPos, scrollPosPx }) =>
        homeScrollPos - scrollPosPx;

    export const toEndPx = ({ endScrollPosPx, scrollPosPx }) =>
        endScrollPosPx - scrollPosPx;

    export const toStartPx = ({ startScrollPosPx, scrollPosPx }) =>
        startScrollPosPx - scrollPosPx;
</script>

<script>
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut, linear } from "svelte/easing";
  import { get_current_component } from "svelte/internal";

  const component = get_current_component();
  const svelteDispatch = createEventDispatcher();
  const dispatch = (name, detail) => {
    svelteDispatch(name, detail);
    component.dispatchEvent &&
      component.dispatchEvent(
        new CustomEvent(name, {
          detail,
          bubbles: true,
          cancelable: true,
          composed: true // makes the event jump shadow DOM boundary
        })
      );
  };

  let contentHeight;
  let containerHeight;
  let container;

  let scrollPosPx = 0;
  let animatingScroll = false;
  let endScrollPosPx;
  let startScrollPosPx = 0;
  let prevScrollPosPx;
  let targetScrollPx;
  let scrollDir;
  let targetPos = "home";
  let loading = true;
  let scrolldata = {};

  export let startpos = 0; // px past the end
  export let homepos = 0; //px from the top
  export let endpos = 0; // px above the top - or negative value for before the end
  export let duration = 900;
  export let easing = cubicOut;
  export let isprevnav = false;
  export let scrolltoposition = null;
  export let jumptoposition = null;
  export let pgId = 0;

  async function onScroll(e) {
    prevScrollPosPx = scrollPosPx;
    scrollPosPx = e.target.scrollTop;
    if (!animatingScroll) {
      progress.set(scrollPosPx, { duration: 0 });
    }

    let action = null;

    if (prevScrollPosPx !== scrollPosPx) {
      dispatch("scroll", scrolldata, pgId);
      if (scrollPosPx === endScrollPosPx) {
        action = "next";
      }
      if (scrollPosPx === startScrollPosPx) {
        action = "prev";
      }

      if (scrollPosPx === homeScrollPos) {
        action = "home";
      }
      dispatch(action, scrolldata);
    }
  }

  function onWheel(e) {
    if (animatingScroll) {
      e.preventDefault();
    } 
  }

  export let progress = tweened(0, {
    duration,
    easing
  });

  export async function jumpToPos(destPos) {
    return await scrollToPos(destPos, false);
  }

  export async function scrollToPos(destPos = "home", anim = true) {
    if (!destPos) {
      return;
    }
    targetPos = destPos;
    switch (destPos) {
      case "offscreen":
        targetScrollPx = endScrollPosPx + 100;
        break;
      case "start":
        targetScrollPx = startScrollPosPx;
        break;
      case "end":
        targetScrollPx = endScrollPosPx;
        break;
      case "beforeStart":
        targetScrollPx = startScrollPosPx + 1;
        break;
      case "beforeEnd":
        targetScrollPx = endScrollPosPx - 1;
        break;
      default:
        targetScrollPx = homeScrollPos;
        break;
    }
    if (anim) {
      animatingScroll = true;
      await progress.set(targetScrollPx);
      animatingScroll = false;
    } else {
      await progress.set(targetScrollPx, { duration: 0 });
    }
  }

  // this needs some explaining. what problem am I solving here? initialisation of the frame at some point
//   providing a natural flow when going back
  async function initPos(p) {
    setTimeout(async () => {
      if (isprevnav) {
        await scrollToPos("beforeEnd", false);
      } else {
        await scrollToPos("beforeStart", false);
      }
      loading = false;
      await scrollToPos("home");

    }, 200);
  }

  $: if (animatingScroll) container.scrollTop = $progress;
  $: endScrollPosPx = containerHeight + contentHeight + endpos + startpos;
  $: homeScrollPos = containerHeight - homepos + startpos;
  $: scrollDir = scrollPosPx - prevScrollPosPx;
  $: scrollToPos(scrolltoposition);
  $: jumpToPos(jumptoposition);
  $: initPos(pgId);
  $: {
    scrolldata = {
      contentHeight,
      containerHeight,
      scrollPosPx,
      endScrollPosPx,
      startScrollPosPx,
      homeScrollPos,
      scrollDir,
      animatingScroll,
    };
  }
</script>

<style>
  .scrollmation-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
    overscroll-behavior: none;
  }
  .scrollmation-container::-webkit-scrollbar {
    display: none;
  }
  .scrollmation-scroll-spacer {
    height: 1px;
  }
</style>

<div
  class="scrollmation-container"
  bind:this={container}
  bind:clientHeight={containerHeight}
  on:scroll={onScroll}
  on:wheel={onWheel}
  style="opacity: {loading ? 0 : 1}">
  {#if !loading}
    <div
      class="scrollmation-fg"
      bind:clientHeight={contentHeight}
      style="margin-top: {containerHeight + startpos}px; margin-bottom: {containerHeight + endpos}px">
      <slot />
      <div class="scrollmation-scroll-spacer">&nbsp</div>
    </div>
  {/if}
</div>
