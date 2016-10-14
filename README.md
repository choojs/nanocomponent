# cache-element [![stability][0]][1]
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
const cache = require('cache-element')
const html = require('bel')

const renderEl = cache(createEl, function compare (curr, prev) {
  if (curr && !prev) return true
  return (prev === curr)
})

let el = renderEl('Tubi') // creates new element
let el = renderEl('Tubi', 'Tubi') // returns cached element (proxy)
let el = renderEl('Babs', 'Tubi') // creates new element

function createEl (name, age) {
  return html`
    <p>The person's name is ${name}</p>
  `
}
```

### Widget
Here we take a widget (e.g. d3, gmaps) and wrap it so it return a DOM node
once, and then only has to worry about managing its lifecycle:
```js
const widget = require('cache-element/widget')
const html = require('bel')

const renderEl = widget(function createEl (update) {
  let name = null
  let age = null

  update(onupdate)

  return html`
    <p onload=${onload} onunload=${onunload}>
      Name is ${name} and age is ${age}
    </p>
  `

  function onupdate (newName, newAge) {
    name = newName
    age = newAge
  }

  function onload () {
    console.log('added to DOM')
  }

  function onunload () {
    name = null
    age = null
    console.log('removed from DOM')
  }
})

let el = renderEl('Tubi', 12) // creates new element
let el = renderEl('Tubi', 12) // returns cached element (proxy)
let el = renderEl('Babs', 25) // returns cached element (proxy)
```

## API
### createEl = cache(render(...args), compare?)
Cache an element. The `compare` function is optional, and by default compares
the first and second argument with `===`:
```js
function compare (curr, prev) {
  if (curr && !prev) return true
  return (prev === curr)
}
```

### createEl = widget(render(update(onupdate((...args))))
Render a widget. Takes a `render` function which exposes an `update` function
which takes an `onupdate` function which is passed arguments whenever arguments
are passed into the tree. Unlike `cache`, `widget` takes no `compare` function
as it will always return a `proxy` element. If you want to prevent any updates
from happening, run a comparison inside `onupdate`.

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
const html = require('bel')

const el1 = html`<div>pink is the best</div>`
const el2 = html`<div>blue is the best</div>`

// let's proxy el1
const proxy = html`<div></div>`
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
