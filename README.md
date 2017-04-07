# nanocomponent [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

`1kb` library to wrap native DOM libraries to work with DOM diffing algorithms.

## Usage
```js
// Implementer API
var Nanocomponent = require('nanocomponent')
var html = require('bel')

function MyButton () {
  if (!(this instanceof MyButton)) return new MyButton()
  this._color = null
  Nanocomponent.call(this)
}
MyButton.prototype = Object.create(Nanocomponent.prototype)

MyButton.prototype._render = function (color) {
  this._color = color
  return html`
    <button style="background-color: ${color}">
      Click Me
    </button>
  `
}

MyButton.prototype._update = function (newColor) {
  return newColor !== this._color
}
```

```js
// Consumer API
var MyButton = require('./my-button.js')
var myButton = MyButton()
document.body.appendChild(myButton.render())
```

## Implementing higher level APIs
No matter the language, inheritance is tricky. Each layer adds more
abstractions and can make it hard to understand what's going on. That's why we
don't recommend doing more than one level of inheritance. However, this means
that any API built on top of Nanocomponent directly shouldn't also expose a
prototypical API.

Instead we recommend people use an interface that somewhat resembles Node's
`require('events').EventEmitter` API.

```js
var MyComponent = require('./my-component')
var myComponent = MyComponent()

myComponent.on('render', function () {
  console.log('rendered')
})

myComponent.on('load', function () {
  console.log('loaded on DOM')
})

myComponent.on('unload', function () {
  console.log('removed from DOM')
})

document.body.appendChild(myComponent.render())
```

This API allows consumers of the `MyComponent` to hook into the event system
without needing to inherit. It also allows `MyComponent` to expose more hooks
with little cost. See
[yoshuawuyts/microcomponent](https://github.com/yoshuawuyts/microcomponent) for
an example of how to create a higher level interface.

## API
### `Nanocomponent.prototype()`
Inheritable Nanocomponent prototype. Should be inherited from using
`Nanococomponent.call(this)` and `prototype = Object.create(Nanocomponent)`.

Internal properties are:

- `this._placeholder`: placeholder element that's returned on subsequent
  `render()` calls that don't pass the `._update()` check.
- `this._element`: rendered element that should be returned from the first
  `._render()` call. Used to apply `._load()` and `._unload()` listeners on.
- `this._hasWindow`: boolean if `window` exists. Can be used to create
  elements that render both in the browser and in Node.
- `this._loaded::` boolean if the element is currently loaded on the DOM.
- `this._onload`: reference to the [on-load][on-load] library.

### `DOMNode|placeholder = Nanocomponent.prototype.render()`
Create an instance of the component. Calls `prototype._render()` if
`prototype._update()` returns `true`. As long as the element is mounted on the
DOM, subsequent calls to `.render()` will return a placeholder element with a
`.isSameNode()` method that compares arguments with the previously rendered
node. This is useful for diffing algorithms like
[nanomorph](https://github.com/yoshuawuyts/nanomorph) which use this method to
determine if a portion of the tree should be walked.

### `Nanocomponent.prototype._render([arguments])`
Render an HTML node with arguments. For `prototype._load()` and
`prototype._unload()` to work, make sure you return the same node on subsequent
renders. The Node that's initially returned is saved as `this._element`.

### `Nanocomponent.prototype._update([arguments])`
Return a boolean to determine if `prototype._render()` should be called.
Not called on the first render.

### `Nanocomponent.prototype._load()`
Called when the component is mounted on the DOM.

### `Nanocomponent.prototype._unload()`
Called when the component is removed from the DOM.

## Installation
```sh
$ npm install nanocomponent
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
- [yoshuawuyts/cache-element](https://github.com/yoshuawuyts/cache-element)
- [yoshuawuyts/microcomponent](https://github.com/yoshuawuyts/microcomponent)

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
[adapt]: https://github.com/yoshuawuyts/nanocomponent-adapters/

[on-load]: https://github.com/shama/on-load
