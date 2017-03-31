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
MyButton.prototype = Object.create(Nanocomponent)

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

## API
### `Nanocomponent.prototype()`
Inheritable Nanocomponent prototype. Should be inherited from using
`Nanococomponent.call(this)` and `prototype = Object.create(Nanocomponent)`.

Internal properties are:
- __this._placeholder:__ placeholder element that's returned on subsequent
  `render()` calls that don't pass the `._update()` check.
- __this._element:__ rendered element that should be returned from the first
  `._render()` call. Used to apply `._load()` and `._unload()` listeners on.
- __this._hasWindow:__ boolean if `window` exists. Can be used to create
  elements that render both in the browser and in Node.
- __this._loaded:__ boolean if the element is currently loaded on the DOM.
- __this._onload:__ reference to the [on-load][on-load] library.

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
Evaluates to `true` if not implemented. Not called on the first render.

### `Nanocomponent.prototype._load()`
Called when the component is mounted on the DOM.

### `Nanocomponent.prototype._unload()`
Called when the component is removed from the DOM.

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
[adapt]: https://github.com/yoshuawuyts/nanocomponent-adapters/

[on-load]: https://github.com/shama/on-load
