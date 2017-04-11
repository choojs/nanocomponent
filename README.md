# cached-element [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Cache a [bel][bel] element. Makes rendering elements _very fast™_. Analogous to
React's `.shouldComponentUpdate()` method, but only using native DOM methods.

## Features
- makes rendering elements _very fast™_
- widget API helps with creating stateful wrappers around 3rd party libs
- implemented in only a couple of lines
- only uses native DOM methods

## Usage
### Caching
Here we take a regular element, and cache it so re-renders are fast. We compare
the arguments on each run passing it to the `compare` function:
```js
var cache = require('cache-element')
var html = require('bel')

var element = Element()

let el = element('Tubi', 12) // creates new element
let el = element('Tubi', 12) // returns cached element (proxy)
let el = element('Babs', 12) // creates new element

function Element () {
  return cache(function (name, age) {
    return html`
      <section>
        <p>The person's name is ${name}</p>
        <p>The person's age is ${age}</p>
      </section>
    `
  })
}
```

### Widget
Here we take a widget (e.g. d3, gmaps) and wrap it so it return a DOM node
once, and then only has to worry about managing its lifecycle:
```js
var widget = require('cache-element/widget')
var morph = require('nanomorph')
var html = require('bel')

var element = Element()

var el = element('Tubi', 12) // creates new element
var el = element('Tubi', 12) // returns cached element (proxy)
var el = element('Babs', 25) // returns cached element (proxy)

function Element () {
  return widget({
    onupdate: function (el, name, age) {
      var newEl = html`<p>Name is ${name} and age is ${age}</p>`
      morph(el, newEl)
    },
    render: function (name, age) {
      return html`<p>Name is ${name} and age is ${age}</p>`
    }
  })
}

```

## API
### createEl = cache(render(...args), compare?)
Cache an element. The `compare` function is optional, and defaults to:
```js
function compare (args1, args2) {
  var length = args1.length
  if (length !== args2.length) return false
  for (var i = 0; i < length; i++) {
    if (args1[i] !== args2[i]) return false
  }
  return true
}
```

### createEl = widget(methods)
Render a widget. Takes a `render` function which exposes an `update` function
which takes an `onupdate` function which is passed arguments whenever arguments
are passed into the tree. Unlike `cache`, `widget` takes no `compare` function
as it will always return a `proxy` element. If you want to prevent any updates
from happening, run a comparison inside `onupdate`.

Render a widget. Takes an object with the following methods:
- __render(...args):__ called to render a node. Expects HTML nodes to be
  returned
- __onupdate(el, ...args):__ called when new arguments are passed in. The first
  argument is the rendered node, any arguments are appended as the arguments
- __onload(el):__ called when the DOM node is mounted on the DOM tree
- __onunload(el):__ called when the DOM node is dismounted from the DOM tree.
  Useful to clean up variables, trigger transitions and the like.

### el = createEl(...args)
Render an element, passing it arbitrary arguments. The arguments are passed to
the element's `compare` function (`onupdate` for `widget`).

## FAQ
### Where does this run?
Make sure you're running a diffing engine that checks for `.isSameNode()`, if
it doesn't you'll end up with super weird results because proxy nodes will
probably be rendered which is not what should happen. Probably make sure you're
using [morphdom][md]. Seriously.

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
that if every element in our tree uses `cache-element`, only elements that have
changed will be recomputed and rerendered making things very fast.

### What's the exact difference between cache and widget?
- `cache` return a proxy node if the arguments were the same. If arguments
  change, it'll rerender and return a new node.
- `widget` will always return a proxy node. It also listens for the node to be
  unmounted from the DOM so it can clean up internal references, making it more
  expensive to use.

## Installation
```sh
$ npm install cache-element
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/cache-element.svg?style=flat-square
[3]: https://npmjs.org/package/cache-element
[4]: https://img.shields.io/travis/yoshuawuyts/cache-element/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/cache-element
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/cache-element/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/cache-element
[8]: http://img.shields.io/npm/dm/cache-element.svg?style=flat-square
[9]: https://npmjs.org/package/cache-element
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[bel]: https://github.com/shama/bel
[md]: https://github.com/patrick-steele-idem/morphdom
[210]: https://github.com/patrick-steele-idem/morphdom/pull/81
