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
// Implementer API
// ./button.js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function Button () {
  if (!(this instanceof Button)) return new Button()
  this._color = null
  Nanocomponent.call(this)
}
Button.prototype = Object.create(Nanocomponent.prototype)

Button.prototype._render = function (color) {
  this._color = color
  return html`
    <button style="background-color: ${color}">
      Click Me
    </button>
  `
}

// Override default shallow compare _update function
Button.prototype._update = function (newColor) {
  return newColor !== this._color
}

```

```js
var choo = require('choo')
var Button = require('./button.js')
var button = new Button()

var app = choo()
app.use(store)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      ${button.render(state.color)}
    </body>
  `
}

function store (state, emitter) {
  state.color = 'green'
}

```

## API

### `Nanocomponent.prototype()`
Inheritable Nanocomponent prototype. Should be inherited from using
`Nanocomponent.call(this)` and `prototype = Object.create(Nanocomponent.prototype)`.

Internal properties are:

- `this._proxy`: proxy (aka placeholder) element that is returned on `render` whenever the component is mounted in the document DOM.
- `this._hasWindow`: boolean if `window` exists. Can be used to create
  elements that render both in the browser and in Node.
- `this._args`: a reference to the arguments array that was used during the last `_render()` call.
- `this._id`: a reference to the ID of the root node.  If no ID is found on the root node of the rendered component, this is set to the component ID (`this._ncID`).
- `this._ncID`: internal component instance ID.  This gets generated every time `render` is called when the component is not found in the DOM.
- `this._loaded`: used to debounce `on-load` events.  Is true when `_load` runs, and false after `_unload` runs.
- `this.element`: a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) property that returns the component's DOM node if its mounted in the page and `null` when its not.

### `DOMNode|proxy = Nanocomponent.prototype.render()`

Calling `render` runs a `_render` function whenever the `_update` function returns true.  `render` returns the fully rendered DOM node if the component is found not to be in DOM, otherwise it returns a `_proxy` node that implements `isSameNode`. Arguments are called on `_update` and `_render`.

### `DOMNode = Nanocomponent.prototype._render([arguments...])`
__Must be implemented.__ Component specific render function.  Optionally cache argument values here.  Run anything here that needs to run along side node rendering.  Must return a DOMNode.  Use `_willRender` to run code after `_render` when the component is unmounted.

### `Bool = Nanocomponent.prototype._update([arguments...])`
Return a boolean to determine if `prototype._render()`
should be called.  The `_update` method is analogous to React's `shouldComponentUpdate`.   Called only when the component is mounted in the DOM tree.  Optionally cache argument values or mutate the mounted DOM node.  Defaults to the following shallow compare function:

```js
Nanocomponent.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
```

### `Nanocomponent.prototype._willRender(el)`

A function called right after `_render` returns, but before the fully rendered element is returned to the `render` caller.  Receives a reference to the returning element `el`.  Run any first render hooks here.  The `on-load` hooks are added at this stage.

### `Nanocomponent.prototype._load()`

Called when the component is mounted on the DOM.

### `Nanocomponent.prototype._unload()`

Called when the component is removed from the DOM.

### `Nanocomponent.prototype._didUpdate()`

Called after a mounted component updates.  You can use this hook to call scroll to or other dom methods on the mounted component.
You can access `this._element` to reference the root node mounted in the page.  This hook does not get a `el` argument as this node is tossed away at this stage.


## Installation
```sh
$ npm install nanocomponent
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

`nanomorph`, which saw first use in choo 5, has supported `isSameNode` since it's conception.

### What's the exact difference between cache-component and nanocomponent?

Nanomorph 6 is is a merge of `cache-component` a `nanomorph` 5.  It is essentially cache-component with `on-load` added.

### Whats the relationship beteen `cache-component` and [`cache-element`][ce]?

This module was essentially a merge of [`cache-element`][ce] v2.0.1 with the API of [`nanomorph`][nm]
before [`cache-element`][ce] switched over to using [`nanomorph`][nm] and essentially had a different purpose.
There are still ongoing discussions on the future of [`cache-element`][ce].  The idea behind the inheritance
API is that it provides a handy place to store event handler functions so they don't get redeclared
between render frames like inline functions do.

## Examples

### Vanilla js without choo

```js
// Consumer API
var Button = require('./button.js') // Assuming button.js exports a nanocomponent
var button = new Button()
document.body.appendChild(button.render('green')) // inserted into the dom once
button.render('green') // Noop
button.render('red') // Update the mounted component twice
button.render('blue') // Mounted components return proxy nodes
// Proxy nodes are fiarly useless unless you are using nanomorph
console.log(button.element) // log a reference to the mounted dom node
```

### Binding event handlers as component methods


```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function Button (opts) {
  if (!(this instanceof Button)) return new Button()
  if (!opts) opts = {}
  this._opts = Object.assign({}, opts)
  this._color = null
  this._handleClick = this._handleClick.bind(this) // be sure to bind your methods!

  Nanocomponent.call(this)
}
Button.prototype = Object.create(Nanocomponent.prototype)

Button.prototype._handleClick = function () {
  console.log(`hey you clicked a ${this._color} button`)
}

Button.prototype._render = function (color) {
  this._color = color
  return html`
    <button onclick=${this._handleClick} style="background-color: ${color}">
      Click Me
    </button>
  `
}
```

### ES6 Class Syntax

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

class Button extends Nanocomponent {
  constructor (opts) {
    if (!opts) opts = {}
    super()
    this._opts = Object.assign({foo: 'defaults'})
    this._handleClick = this._handleClick.bind(this)

    this._color = null
  }

  _handleClick () {
    console.log(`hey you clicked a ${this._color} button`)
  }

  _render (color) {
    this._color = color
    return html`
      <button onclick=${this._handleClick} style="background-color: ${color}">
        Click Me
      </button>
    `
  }

  _update (newColor) {
    return newColor !== this._color
  }
}
```

### Mutating the components instead of re-rendering

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')

class TextButton extends Nanocomponent {
  constructor (opts) {
    if (!opts) opts = {}
    super()
    this._opts = Object.assign({foo: 'defaults'})

    this._color = null
    this._text = ''

    this._handleClick = this._handleClick.bind(this)
  }

  _handleClick () {
    console.log(`hey you clicked a ${this._color} button`)
  }

  _render (color, text) {
    this._color = color
    this._text = text
    return html`
      <button onclick=${this._handleClick} style="background-color: ${color}">
        Click Me
      </button>
    `
  }

  _update (color, text) {
    if (color !== this._color) return true // re-render
    if (text !== this._text) {
      this._text = text
      this.element.innerText = this._text // mutate mounted dom node directly
    }
    return false
  }
}
```

### Nested components and component containers

Components nest and can skip renders at intermediary levels.  Components can also act as containers that shape app data flowing into view specific components.

```js
var Nanocomponent = require('nanocomponent')
var html = require('bel')
var Button = require('./button.js')

class ButtonContainer extends Nanocomponent {
  constructor () {
    super()

    this._button1 = new Button ()
    this._button2 = new Button ()
    this._button3 = new Button ()
  }

  _shapeData (state) {
    return [state.colors.color1, state.colors.color2, state.colors.color3]
  }

  _render (state) {
    var colorArray = this._shapeData(state)
    return html`
      <div>
        ${this._button1.render(colorArray[0])}
        ${this._button2.render(colorArray[1])}
        ${this._button3.render(colorArray[2])}
      </div>
    `
  }

  _update (state) {
    var colorArray = this._shapeData(state) // process app specific data in a container
    this._button1.render(colorArray[0]) // pass processed data to owned children components
    this._button2.render(colorArray[1])
    this._button3.render(colorArray[2])
    return false // always return false when mounted
  }
}
```

### Render function only using the DOM API

```js
var Nanocomponent = require('nanocomponent')

function Button (opts) {
  if (!(this instanceof Button)) return new Button()

  Nanocomponent.call(this)
}
Button.prototype = Object.create(Nanocomponent.prototype)

Button.prototype._render = function (color) {
  var el = document.createElement('div')
  el.innerText = 'hello world'
  return el
  `
}
```

## See Also
- [shama/bel](https://github.com/shama/bel)
- [yoshuawuyts/nanomorph](https://github.com/yoshuawuyts/nanomorph)
- [yoshuawuyts/nanoraf](https://github.com/yoshuawuyts/nanoraf)
- [shama/on-load](https://github.com/shama/on-load)
- [yoshuawuyts/observe-resize](https://github.com/yoshuawuyts/observe-resize)
- [bendrucker/document-ready](https://github.com/bendrucker/document-ready)
- [yoshuawuyts/on-intersect](https://github.com/yoshuawuyts/on-intersect)
- [yoshuawuyts/on-idle](https://github.com/yoshuawuyts/on-idle)
- [yoshuawuyts/nanobounce](https://github.com/yoshuawuyts/nanobounce)
- [yoshuawuyts/nanoframe](https://github.com/yoshuawuyts/nanoframe)

## Similar Packages
- [shama/base-element](https://github.com/shama/base-element)
- [yoshuawuyts/cache-element][ce]
- [yoshuawuyts/microcomponent](https://github.com/yoshuawuyts/microcomponent)
- [yoshuawuyts/nanocomponent](https://github.com/yoshuawuyts/nanocomponent)

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
