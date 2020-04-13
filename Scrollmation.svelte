<script context="module">
    export const toHomeRatio = ({
        homeScrollPos,
        scrollPosPx,
        startScrollPosPx,
    }) => (homeScrollPos - scrollPosPx) / (homeScrollPos - startScrollPosPx)

    export const toStartRatio = ({
        homeScrollPos,
        scrollPosPx,
        startScrollPosPx,
    }) => (scrollPosPx - startScrollPosPx) / (homeScrollPos - startScrollPosPx)

    export const toEndRatio = ({
        scrollPosPx,
        endScrollPosPx,
        homeScrollPos,
    }) => (scrollPosPx - endScrollPosPx) / (homeScrollPos - endScrollPosPx)

    export const toRangeRatio = ({
        scrollPosPx,
        endScrollPosPx,
        startScrollPosPx,
    }) => (scrollPosPx - endScrollPosPx) / (startScrollPosPx - endScrollPosPx)

    export const fullRangePx = ({ endScrollPosPx, startScrollPosPx }) =>
        endScrollPosPx - startScrollPosPx

    export const toHomePx = ({ homeScrollPos, scrollPosPx }) =>
        homeScrollPos - scrollPosPx

    export const toEndPx = (endScrollPosPx, scrollPosPx) =>
        endScrollPosPx - scrollPosPx

    export const toStartPx = (startScrollPosPx, scrollPosPx) =>
        startScrollPosPx - scrollPosPx
</script>

<script>
    import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
    import { tweened } from 'svelte/motion'
    import { cubicOut, linear } from 'svelte/easing'
    const dispatch = createEventDispatcher()

    let contentHeight
    let containerHeight
    let container

    let scrollPosPx = 0
    let animatingScroll = false
    let endScrollPosPx
    let startScrollPosPx = 0
    let prevScrollPosPx
    let targetScollPx
    let scrollDir
    let targetPos = 'home'
    let loading = true

    export let startpos = 0 // px past the end
    export let homepos = 0 //px from the top
    export let endpos = 100 // px above the top - or negative value for before the end
    export let duration = 900
    export let easing = cubicOut
    export let scrolldata = {}
    export let isPrevNav = false
    export let scrolltoposition = null
    export let jumptoposition = null
    export let pgId = 0

    async function onScroll(e) {
        
        prevScrollPosPx = scrollPosPx
        scrollPosPx = e.target.scrollTop
        if (!animatingScroll) {
            progress.set(scrollPosPx, { duration: 0 })
        }

        let action = null

        if (prevScrollPosPx !== scrollPosPx) {
            const scrollEvent = new CustomEvent('scroll', {
                detail: scrolldata,
                bubbles: true,
                cancelable: true,
                composed: true // makes the event jump shadow DOM boundary
            });
            this.dispatchEvent(scrollEvent)
            if (scrollPosPx === endScrollPosPx) {
                action = 'next'
            }
            if (scrollPosPx === startScrollPosPx) {
                action = 'prev'
            }

            if (scrollPosPx === homeScrollPos) {
                action = 'home'
            }

            const actionEvent = new CustomEvent(action, {
                    detail: scrolldata,
                    bubbles: true,
                    cancelable: true,
                    composed: true // makes the event jump shadow DOM boundary
                });
            if (animatingScroll && scrollPosPx === targetScollPx) {
                this.dispatchEvent(actionEvent)
                // dispatch(action, scrolldata)
                return
            }

            if (!animatingScroll && action) {
                this.dispatchEvent(actionEvent)
                // dispatch(action, scrolldata)
            }
        }
    }

    function onWheel(e) {
        if (animatingScroll) {
            e.preventDefault()
        }
    }

    export let progress = tweened(0, {
        duration,
        easing,
    })

    export async function jumpToPos(destPos) {
        return await scrollToPos(destPos, false)
    }

    export async function scrollToPos(destPos = 'home', anim = true) {
        if (!destPos) {
            return
        }
        targetPos = destPos
        switch (destPos) {
            case 'offscreen':
                targetScollPx = endScrollPosPx + 100
                break
            case 'start':
                targetScollPx = startScrollPosPx
                break
            case 'end':
                targetScollPx = endScrollPosPx
                break
            case 'beforeStart':
                targetScollPx = startScrollPosPx + 1
                break
            case 'beforeEnd':
                targetScollPx = endScrollPosPx - 1
                break
            default:
                targetScollPx = homeScrollPos
                break
        }
        if (anim) {
            animatingScroll = true
            await progress.set(targetScollPx)
            animatingScroll = false
        } else {
            await progress.set(targetScollPx, { duration: 0 })
        }
    }

    async function initPos(p) {
        setTimeout(async () => {
            if (isPrevNav) {
                await scrollToPos('beforeEnd', false)
            } else {
                await scrollToPos('beforeStart', false)
            }
            animatingScroll = true
            loading = false
            await scrollToPos('home')
        }, 200)
    }

    $: if (animatingScroll) container.scrollTop = $progress
    $: endScrollPosPx = containerHeight + contentHeight + endpos + startpos
    $: homeScrollPos = containerHeight - homepos + startpos
    $: scrollDir = scrollPosPx - prevScrollPosPx
    $: scrollToPos(scrolltoposition)
    $: jumpToPos(jumptoposition)
    $: initPos(pgId)
    $: {
        scrolldata = {
            contentHeight,
            containerHeight,
            scrollPosPx,
            endScrollPosPx,
            startScrollPosPx,
            homeScrollPos,
            scrollDir,
        }
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
    .scrollmation-scroll-spacer{
      height: 1px;
    }

    .scrollmation-fg{
      width: 100%;
      padding-right: 65px;
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
