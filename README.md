# nanocomponent [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Create performant HTML elements.

## Features
- works with every framework
- significantly speeds up perceived performance
- improves rendering performance
- graciously falls back if APIs are not available
- weighs `~4kb`

## Usage
### Cache a static HTML element
```js
var component = require('nanocomponent')
var html = require('bel')

var staticElement = component(html`
  <div>heya</div>
`)
var el = staticElement()
console.log(el)
```

### Cache a dynamic HTML element
```js
var cachedElement = component(function (foo) {
  return html`
    <div>${foo}</div>
  `
})
console.log(cachedElement('hey folks'))   // render
console.log(cachedElement('hey folks'))   // return cached element
console.log(cachedElement('hey humans'))  // render again
```

### Defer rendering until the browser has spare time available
```js
var politeElement = component({
  placeholder: function () {
    return html`
      <p>lol not loaded yet</p>
    `
  },
  render: function () {
    return html`
      <p>HOW'S IT GOING CHAP</p>
    `
  }
})

console.log(politeElement())
setTimeout(function () {
  console.log(politeElement())
}, 1000)
```

### Trigger lifecycle events when loading and unloading elements to the DOM
```js
var widgetElement = component({
  onload: function (el) {
    el.textContent = 'totally loaded now'
  },
  onunload: function (el) {
    el.textContent = 'no more free lunch'
  },
  onupdate: function (el, verb) {
    el.textContent = `totally ${verb}ing now`
  },
  render: function (verb) {
    return html`
      <p>lol not ${verb}ed yet</p>
    `
  }
})
console.log(widgetElement('load'))
var el = widgetElement('blep')
document.body.appendChild(el)
document.body.removeChild(el)
```

### Trigger lifecycle events when coming in and out of view
```js
var viewportElement = component({
  onenter: function (el) {
    el.textContent = 'BEHOLD THE GOBLIN'
  },
  onexit: function (el) {
    el.textContent = 'THE PONIES HAVE COME'
  },
  render: function () {
    return html`
      <h1>WHO COULD IT BE</h1>
    `
  }
})
console.log(viewportElement())
```

### Trigger lifecycle events when resizing
```js
var resizeElement = component({
  onresize: function (el) {
    var parent = el.parentNode
    console.log('element dimensions', el.getBoundingRectangle())
    console.log('parent dimensions', parent.getBoundingRectangle())
  },
  render: function () {
    return html`
      <div>hello planet</div>
    `
  }
})
console.log(resizeElement())
```

## API
### render = nanocomponent(HtmlOrFunctionOrObject)
Create a render function for a component based depending on the arguments that
are passed in:
- __HTMLElement:__ cache the result of the function until it's removed from the
    DOM
- __function:__ cache the result of the function until new arguments are passed
    or it's removed from the DOM
- __object:__ create an object with different methods attached. Cached until
    new arguments are passed in or when it's removed from the DOM

When passing an object, the availble methods are:
- __render(...args):__ (required) Render DOM elements.
- __placeholder(..args)__ Render DOM elements and delegate the `render` call to
  the next `requestIdleCallback` tick. This is useful to spread CPU intensive
  work over more time and not block the render loop. When executed on the
  server `placeholder` will always be rendered in favor of `render`. This makes
  it easier for client-side JS to pick up where the server left off
  (rehydration).
- __onupdate(el, ...args):__ Allows you to change the internal DOM state when
  new arguments are passed in. It's called when the returned `render()` call is
  called after an initial render with different arguments. Argument equality is
  shallowly checked using a `===` check on each argument. The first argument is
  the currently rendered argument.
- __onenter:__ called when the element comes into view, relies on
  `window.IntersectionObserver`
- __onexit:__ Called when the element goes out of view, relies on
  `window.IntersectionObserver`
- __onload(el):__ Called when the element is appended onto the DOM
- __onunload(el):__ Called when the element is removed from the DOM
- __onresize:__ Called when the element changes size. :warning: This method can
  be called in high frequency and can cause strain on your CPU. Caution and/or
  debounce methods are advised.

### el = render(...args)
Call the corresponding `render` function an receive DOM elements. As long as an
element exists on the DOM, subsequent calls to `render` will return an empty
element with a `.isSameNode()` method on it which can be used as a caching hint
for HTML diffing trees.

## Installation
```sh
$ npm install nanocomponent
```

## See Also
- [bendrucker/document-ready](https://github.com/bendrucker/document-ready)
- [shama/bel](https://github.com/shama/bel)
- [shama/on-load](https://github.com/shama/on-load)
- [yoshuawuyts/choo](https://github.com/yoshuawuyts/choo)
- [yoshuawuyts/nanomorph](https://github.com/yoshuawuyts/nanomorph)
- [yoshuawuyts/nanoraf](https://github.com/yoshuawuyts/nanoraf)
- [yoshuawuyts/nanotick](https://github.com/yoshuawuyts/nanotick)
- [yoshuawuyts/observe-resize](https://github.com/yoshuawuyts/observe-resize)
- [yoshuawuyts/on-intersect](https://github.com/yoshuawuyts/on-intersect)
- [yoshuawuyts/polite-element](https://github.com/yoshuawuyts/polite-element)

## Similar Packages
- [shama/base-element](https://github.com/shama/base-element)
- [yoshuawuyts/cache-element](https://github.com/yoshuawuyts/cache-element)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nanocomponent.svg?style=flat-square
[3]: https://npmjs.org/package/nanocomponent
[4]: https://img.shields.io/travis/yoshuawuyts/nanocomponent/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/nanocomponent
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/nanocomponent/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/nanocomponent
[8]: http://img.shields.io/npm/dm/nanocomponent.svg?style=flat-square
[9]: https://npmjs.org/package/nanocomponent
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
