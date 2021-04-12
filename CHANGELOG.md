# nanocomponent Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 6.6.0 - 2021-04-12
- You can modify makeID (https://github.com/choojs/nanocomponent/pull/96)

## 6.5.3 - 2019-11-12
- Fix `onclick` event name in readme example (https://github.com/choojs/nanocomponent/pull/82)
- Add doc note about maintaining control of a component (https://github.com/choojs/nanocomponent/pull/89)
- Point out the `createElement()` return value should be a single DOM node (https://github.com/choojs/nanocomponent/pull/93)

## 6.5.2 - 2018-04-20
- Allow SVGs as the root node (https://github.com/choojs/nanocomponent/pull/79)
- Update deps

## 6.5.1 - 2018-02-11
- Update nanotiming@7.2.0
- Update devdeps: tap-run, dependency-check, browserify, bankai

## 6.4.6 - 2017-12-05
- Proxy elements are created matching the root node returned from the `createElement` method. (🙏@tornqvist🙏)

## 6.4.5 - 2017-12-03
- Pin `on-load` to v3.3.4 to fix node import.

## 6.4.4 - 2017-12-03
- Pin `on-load` to v3.3.3 to fix unbundled electron import.

## 6.4.3 - 2017-12-02
- Pin `on-load` to 3.3.2 to fix unbundled electron import.

## 6.4.1 - 2017-09-11
- Fixed `afterreorder` hook typo.
- Update `on-load` to handle `<head>` loading and for addded assertions.

## 6.4.0 - 2017-09-04

- **Added**: `.rerender()` method to allow re-rendering with the last rendered arguments if internal state changes.
- Updated docs for `rerender`.
- Add a few more pitfall pointers in the lifecycle API docs around rerendering in `beforerender`.

## 6.3.0 - 2017-08-24

- **Added**: Use [`nanoassert`](https://github.com/emilbayes/nanoassert) in the browser.

## 6.2.0 - 2017-08-18

- **Added**: `afterreorder` event which is called after your component is remounted on sibbling reorders.

## 6.1.0 - 2017-08-14

- **Added**: [nanotiming](https://github.com/choojs/nanotiming) timings.  You can name component instances and it will emit timing information. See [nanocomponent/pull/47](https://github.com/choojs/nanocomponent/pull/47)

## 6.0.1 - 2017-08-09

- **Fixed**: [[`f9f7540415`](https://github.com/choojs/nanocomponent/commit/f9f7540415)] - load & unload callbacks should be passed el (timwis)

## 6.0.0 - 2017-08-09

🎉 nanocomponent and [cache-component][cc] are merged into one module: `nanocomponent@6.0.0` 🎉.

Be sure to read the README so that you get an understanding of the new API, but here is a quick summary of what has changed from the perspective of both modules:

### Changes since `cache-component@5`

`nanocomponent@6` is mostly the same as `cache-component@5` except a few methods are renamed and everything you interact with has had the `_` prefix removed.

- **Breaking**: The `_element` [getter][getter] is renamed to `element`.
- **Breaking**: `_willMount` is renamed to `beforerender` because DOM mounting can't be guaranteed from the perspective of a component.
- **Breaking**: `_didMount` is removed.  Consider using `load` instead now.
- **Breaking**: `_update` is renamed to `update` and should always be implemented.  Instead of the old default shallow compare, not implementing `update` throws.  You can `require('nanocomponent/compare')` to implement the shallow compare if you want that still.  See below.
- **Breaking**: `_args` is removed.  `arguments` in `createElement` and `update` are already "sliced", so you can simply capture a copy in `update` and `createElement` and use it for comparison at a later time.
- **Breaking**: `_willUpdate` is removed.  Anything you could do in `_willUpdate` you can just move to `update`.
- **Changed**: `_didUpdate` is renamed to `afterupdate`.  It also receives an element argument `el` e.g. `afterupdate(el)`.  This makes its argument signature consistent with the other life-cycle methods.
- **Added**: Added [on-load][ol] hooks `load` and `unload`.  [on-load][ol] listeners only get added when one or both of the hooks are implemented on a component making the mutation observers optional.


#### `cache-component@5` to `nanocomponent@6` upgrade guide:

- Renamed `_render` to `createElement`.
- You must implement `update` now.  Rename existing `_update` method to `update`.  Here is an example of doing shallow compare on components that didn't implement their own update function previously:

```js
var html = require('choo/html')
var Component = require('nanocomponent')
var compare = require('nanocomponent/compare')

class Meta extends Component {
  constructor () {
    super()

    this.arguments = []
  }

  createElement (title, artist, album) {
    this.arguments = arguments // cache a copy of arguments

    return html`
      <div>
        <p>${title}</p>
        <p>
          ${artist} - ${album}
        </p>
      </div>
    `
  }

  // Implement this to recreate cache-component@5
  // behavior when update was not implemented
  update () {
    return compare(arguments, this.arguments)
  }
}

```

- Rename components with `_willMount` to `beforerender`
- Move any `_didMount` implementations into `load` or a `window.requestAnmimationFrame` inside of `beforerender`.
- Move any `_willUpdate` implementations into `update`.
- Rename `_didUpdate` to `afterupdate`.
- Take advantage of `load` and `unload` for DOM insertion aware node interactions 🙌

### Changes since `nanocomponent@5`

`nanocomponent@6` has some subtle but important differences from `nanocompnent@5`.  Be sure to read the README and check out the examples to get an understanding of the new API.

- **Breaking**: The `_element` property is removed.  A [getter][getter] called `element` is now used instead.  Since this is now a read-only getter, you must not assign anything to this property or else bad things will happen.  The `element` getter returns the component's DOM node if mounted in the page, and `undefined` otherwise.  You are allowed to mutate that DOM node by hand however.  Just don't reassign the property on the component instance.
- **Fixed**: Components can gracefully be removed, re-ordered and remounted between views.  You can even mutate the same component over individual instances.  This is an improvement over `nanocomponent@5`.
- **Breaking**: `_render` is renamed to `createElement` and must now return a DOM node always.  In earlier versions you could get away with not returning from `_render` and assigning nodes to `_element`.  No longer!  Also, you should move your DOM mutations into `update`.
- **Changed**: Update still works the same way: return true to run `createElement` or return false to skip a call to `createElement` when `render` is called.  If you decide to mutate `element` "by hand" on updates, do that here (rather than conditional paths inside `createElement`).
- **Changed**: `_load` and `_unload` renamed to `load` and `unload`. They have always been optional, but now the mutation observers are only added if at least one of these methods are implemented prior to component instantiation.
- **Added**: `beforerender` lifecycle hook.  Its similar to `load` but runs before the function call to `render` returns on unmounted component instances.  This is where the [on-load][ol] listeners are added and is a good opportunity to add any other lifecycle hooks.
- **Added**: `afterupdate` runs after `update` returns true and the results of `createElement` is mutated over the mounted component.  Useful for adjusting scroll position.

#### `nanocomponent@5` to `nanocomponent@6` upgrade guide:

- Read through the new leaflet example to get an idea of the differences between the old and new API. 🗺
- Renamed `_render` to `createElement` and `_update` to `update`.
- Move any DOM mutation code from `createElement` into `update`.
- Ensure `createElement` returns a DOM node always. (You will get warnings if you don't and it probably won't work)
- Rename `_load` and `_unload` to `load` and `unload`.
- Consider moving any `load` actions into `beforerender` if they don't depend on the newly rendered node being mounted in a DOM tree yet.
- Take advantage of `afterupdate` allowing you to interact with your component after `createElement` is called on mounted components 🙌

[ol]: https://github.com/shama/on-load
[cc]: https://github.com/hypermodules/cache-component
[nanohtml]: http://ghub.io/nanohtml
[nm]: http://ghub.io/nanomorph
[getter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
