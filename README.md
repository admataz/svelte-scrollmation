# Svelte Scrollmation

A [svelte.js](https://svelte.dev) component. Wrap you content with this, and give it reactive scrolling superpowers.

## Usage in a `svelte` component: 

`Scrollmation` component to wrap your component

Events: 
- `next` - scroll has reached the end position - good time to trigger the next thing
- `prev` - scroll has reached the start position - good time to trigger the previous thing
- `home` - scroll has settled on the landing position (usually on first load)
- `scroll` - fires while there is movement with updated position values - good to use for responsive transitions: 

You could

- Grow 
- Fade
- Move item 
- Rotate item
- Change colour
- Trigger another animation 
- Horizontal pan
- Zoom panorama
- Parallax effect 
- ...

It's really up to you. 


Example: 

```html
<script>
// import the component and helper functions
  import Scrollmation, {
    toHomeRatio,
    toStartRatio,
    toEndRatio,
    toRangeRatio,
    fullRangePx,
    toHomePx,
    toEndPx,
    toStartPx
  } from "scrollmation";

// set some variable values to use in the render
  let rangeRatio
  
// event handler
  function onScroll({ type, detail }) {
	  rangeRatio = toHomeRatio(detail)
  }
</script>

<style>
  main {
    text-align: center;
    height: 100%;
  }

  h1 {
    font-size: 10em;
  }

</style>

<main style="background-color:rgba({rangeRatio*100} 0 {255-(rangeRatio*255)})">
  <Scrollmation on:scroll={onScroll}>
    <h1>
      🌞
    </h1>
  </Scrollmation>
</main>

```



## Web Component usage
More limited capability - but useful for some instances. 

See the example in [./public/index.html](./public/index.html)


[License MIT](/LICENSE)
Copyright 2020 Adam Davis

