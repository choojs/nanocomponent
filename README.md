# nanocomponent [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Native DOM components that pair nicely with DOM diffing algorithms.

## Features
- Isolate native DOM libraries from DOM diffing algorithms
- Makes rendering elements _very fast™_ by avoiding unnecessary rendering
- Component nesting and state update passthrough
- Implemented in only a few lines
- Only uses native DOM methods
- Class based components offering a familiar component structure
- Works well with [bel][bel] and [yoyoify][yoyoify]

## Usage
```js
// button.js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function Button () {
  if (!(this instanceof Button)) return new Button()
  this.color = null
  Nanocomponent.call(this)
}
Button.prototype = Object.create(Nanocomponent.prototype)

Button.prototype.createElement = function (color) {
  this.color = color
  return html`
    <button style="background-color: ${color}">
      Click Me
    </button>
  `
}

// Implement conditional rendering
Button.prototype.update = function (newColor) {
  return newColor !== this.color
}
```

```js
// index.js
var choo = require('choo')

var Button = require('./button.js')
var button = Button()

var app = choo()
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      ${button.render(state.color)}
    </body>
  `
}

app.use(function (state, emitter) {
  state.color = 'green'
})
```

## Patterns
These are some common patterns you might encounter when writing components.

### Standalone
Nanocomponents is part of the choo ecosystem, but works great standalone!

```js
var Button = require('./button.js')
var button = new Button()

// Attach to DOM
document.body.appendChild(button.render('green'))

// Update mounted component
button.render('green')
button.render('red')

// Log a reference to the mounted dom node
console.log(button.element)
```

### Binding event handlers as component methods

Sometimes it's useful to be pass around prototype methods into other functions.
This can be done by binding the method that's going to be passed around:

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function Component () {
  if (!(this instanceof Button)) return new Component()
  Nanocomponent.call(this)

  // Bind the method so it can be passed around
  this.handleClick = this.handleClick.bind(this)
}
Component.prototype = Object.create(Nanocomponent.prototype)

Component.prototype.handleClick = function (ev) {
  console.log('element is', this.element)
}

Component.prototype.createElement = function () {
  return html`<button onClick=${this.handleClick}>
    My component
  </button>`
}

Component.prototype.update = function () {
  return false // Never re-render
}
```

### ES6 Class Syntax

Because Class syntax is just sugar for prototype code, Nanocomponent can be
written using Classes too:

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

class Component extends Nanocomponent {
  constructor () {
    super()
    this.color = null
  }

  createElement (color) {
    this.color = color
    return html`
      <div style="background-color: ${color}">
        Color is ${color}
      </div>
    `
  }

  update (newColor) {
    return newColor !== this.color
  }
}
```

### Mutating the components instead of re-rendering
Sometimes you might want to mutate the element that's currently mounted, rather
than performing DOM diffing. Think cases like third party widgets that manage
themselves.

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function Component () {
  if (!(this instanceof Button)) return new Component()
  Nanocomponent.call(this)
  this.text = ''
}
Component.prototype = Object.create(Nanocomponent.prototype)

Component.prototype.createElement = function (text) {
  this.text = text
  return html`<h1>${text}</h1>`
}

Component.prototype.update = function (text) {
  if (text !== this.text) {
    this.text = text
    this.element.innerText = this.text   // Directly update the element
  }
  return false                           // Don't call createElement again
}

Component.prototype.unload = function (text) {
  console.log('No longer mounted on the DOM!')
}
```

### Nested components and component containers
Components nest and can skip renders at intermediary levels.  Components can
also act as containers that shape app data flowing into view specific
components.

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')
var Button = require('./button.js')

function Component () {
  if (!(this instanceof Button)) return new Component()
  Nanocomponent.call(this)
  this.button1 = new Button ()
  this.button2 = new Button ()
  this.button3 = new Button ()
}
Component.prototype = Object.create(Nanocomponent.prototype)

Component.prototype.createElement = function (state) {
  var colorArray = shapeData(state)
  return html`
    <div>
      ${this.button1.render(colorArray[0])}
      ${this.button2.render(colorArray[1])}
      ${this.button3.render(colorArray[2])}
    </div>
  `
}

Component.prototype.update = function (state) {
  var colorArray = shapeData(state) // process app specific data in a container
  this.button1.render(colorArray[0]) // pass processed data to owned children components
  this.button2.render(colorArray[1])
  this.button3.render(colorArray[2])
  return false // always return false when mounted
}

// Some arbitrary data shaping function
function shapeData (state) {
  return [state.colors.color1, state.colors.color2, state.colors.color3]
}
```

## FAQ
### Where does this run?
Make sure you're running a diffing engine that checks for `.isSameNode()`, if
it doesn't you'll end up with super weird results because proxy nodes will
probably be rendered which is not what should happen. Probably make sure you're
using [morphdom][md] or [nanomorph][nm]. Seriously.

### What's a proxy node?
It's a node that overloads `Node.isSameNode()` to compare it to another node.
This is needed because a given DOM node can only exist in one DOM tree at the
time, so we need a way to reference mounted nodes in the tree without actually
using them. Hence the proxy pattern, and the recently added support for it in
certain diffing engines:

```js
var html = require('bel')

var el1 = html`<div>pink is the best</div>`
var el2 = html`<div>blue is the best</div>`

// let's proxy el1
var proxy = html`<div></div>`
proxy.isSameNode = function (targetNode) {
  return (targetNode === el1)
}

el1.isSameNode(el1)   // true
el1.isSameNode(el2)   // false
proxy.isSameNode(el1) // true
proxy.isSameNode(el2) // false
```

### How does it work?
[Morphdom][md] is a diffing engine that diffs real DOM trees. It runs a series
of checks between nodes to see if they should either be replaced, removed,
updated or reordered. This is done using a series of property checks on the
nodes.

Since [v2.1.0][210] `morphdom` also runs `Node.isSameNode(otherNode)`. This
allows us to override the function and replace it with a custom function that
proxies an existing node. Check out the code to see how it works. The result is
that if every element in our tree uses `nanocomponent`, only elements that have
changed will be recomputed and re-rendered making things very fast.

`nanomorph`, which saw first use in choo 5, has supported `isSameNode` since
its conception.

## API
### `component = Nanocomponent()`
Create a new Nanocomponent instance. Additional methods can be set on the
prototype.

### `component.render([arguments…])`
Render the component. Returns a proxy node if already mounted on the DOM. Proxy
nodes make it so DOM diffing algorithms leave the element alone when diffing.

### `component.element`
A [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
property that returns the component's DOM node if its mounted in the page and
`null` when its not.

### `DOMNode = Nanocomponent.prototype.createElement([arguments…])`
__Must be implemented.__ Component specific render function.  Optionally cache
argument values here.  Run anything here that needs to run along side node
rendering.  Must return a DOMNode. Use `beforerender` to run code after
`createElement` when the component is unmounted.  Previously named `_render`.  Arguments that passed to `render` are passed to `createElement`.

### `Boolean = Nanocomponent.prototype.update([arguments…])`
__Must be implemented.__ Return a boolean to determine if
`prototype.createElement()` should be called.  The `update` method is analogous to
React's `shouldComponentUpdate`. Called only when the component is mounted in
the DOM tree.  Arguments passed to `render` are passed to `update`.

### `Nanocomponent.prototype.beforerender(el)`
A function called right after `createElement` returns with `el`, but before the fully rendered
element is returned to the `render` caller. Run any first render hooks here. The `load` and
`unload` hooks are added at this stage.

### `Nanocomponent.prototype.load(el)`
Called when the component is mounted on the DOM. Uses [on-load][onload] under
the hood.

### `Nanocomponent.prototype.unload(el)`
Called when the component is removed from the DOM. Uses [on-load][onload] under
the hood.

### `Nanocomponent.prototype.afterupdate(el)`
Called after a mounted component updates (e.g. `update` returns true).  You can use this hook to call
`element.scrollIntoView` or other dom methods on the mounted component.

## Installation
```sh
$ npm install nanocomponent
```

## See Also
- [choojs/choo](https://github.com/choojs/choo)
- [shama/bel](https://github.com/shama/bel)
- [shama/on-load](https://github.com/shama/on-load)
- [yoshuawuyts/observe-resize](https://github.com/yoshuawuyts/observe-resize)
- [bendrucker/document-ready](https://github.com/bendrucker/document-ready)
- [yoshuawuyts/on-intersect](https://github.com/yoshuawuyts/on-intersect)
- [yoshuawuyts/on-idle](https://github.com/yoshuawuyts/on-idle)

## Similar Packages
- [shama/base-element](https://github.com/shama/base-element)
- [yoshuawuyts/cache-element](https://github.com/yoshuawuyts/cache-element)
- [yoshuawuyts/microcomponent](https://github.com/yoshuawuyts/microcomponent)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nanocomponent.svg?style=flat-square
[3]: https://npmjs.org/package/nanocomponent
[4]: https://img.shields.io/travis/choojs/nanocomponent/master.svg?style=flat-square
[5]: https://travis-ci.org/choojs/nanocomponent
[6]: https://img.shields.io/codecov/c/github/choojs/cache-component/master.svg?style=flat-square
[7]: https://codecov.io/github/choojs/nanocomponent
[8]: http://img.shields.io/npm/dm/nanocomponent.svg?style=flat-square
[9]: https://npmjs.org/package/nanocomponent
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[bel]: https://github.com/shama/bel
[yoyoify]: https://github.com/shama/yo-yoify
[md]: https://github.com/patrick-steele-idem/morphdom
[210]: https://github.com/patrick-steele-idem/morphdom/pull/81
[nm]: https://github.com/yoshuawuyts/nanomorph
[ce]: https://github.com/yoshuawuyts/cache-element
[class]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
[isSameNode]: https://github.com/choojs/nanomorph#caching-dom-elements
[onload]: https://github.com/shama/on-load
