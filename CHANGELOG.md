# nanocomponent Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 6.0.0 - DATE HERE

🎉 nanocomponent and [cache-component][cc] are merged into one module: `nanocomponent@6.0.0` 🎉.

Be sure to read the README so that you get an understanding of the new API, but here is a quick summary of what has changed from the perspective of both modules:

### Changes since `cache-component@5`

`nanocomponent@6` is mostly the same as `cache-component@5` except a few methods are rename and everything you interact with has had the `_` prefix removed.

- **Breaking**: The `_element` [getter][getter] is renamed to `element`.
- **Breaking**: `_willMount` is renamed to `willRender` because DOM mounting can't be guaranteed from the perspective of a component.
- **Breaking**: `_didMount` is removed.  Consider using `load` instead now.  If you want this on-load free hook still, you can just call `window.requestAnimationFrame` from `willRender`.
- **Breaking**: `_willUpdate` is removed.  Anything you can do in `_willUpdate` you can just move to `update`.
- **Breaking**: `_update` is rename to `update` and should always be implemented.  Instead of the old default shallow compare, not implementing `update` throws.  You can `require('nanocomponent/compare')` to implement the shallow compare if you want that still.  See below.
- **Breaking**: `_args` is renamed to `lastArgs`.
- **Breaking**: `_hasWindow` is renamed to `hasWindow`.
- **Changed**: `_didUpdate()` is renamed to `didUpdate` now receives an element argument `el` e.g. `didUpdate(el)`.  This makes it's argument signature consistent with the other life-cycle methods.
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

    this._title = null
    this._artist = null
    this._album = null
  }

  createElement (title, artist, album) {
    this._title = title || '--'
    this._artist = artist || '--'
    this._album = album || '--'

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
    return compare(arguments, this.lastArgs)
  }
}

```

- Rename components with `_willMount` to `willRender`
- Move any `_didMount` implementations into `load` or a `window.requestAnmimationFrame` inside of `willRender`.
- Move any `_willUpdate` implementations into `update`.
- Rename `_didUpdate` to `_didUpdate`.
- Take advantage of `load` and `unload` for DOM insertion aware node interactions 🙌

### Changes since nanocomponent@5

`nanocomponent@6` has some subtle but important differences from `nanocompnent@5`.  Be sure to read the README and check out the examples to get an understanding of the new API.

- **Breaking**: The `_element` property is removed.  A [getter][getter] called `element` is now used instead.  Since this is now a read-only getter, you must not assign anything to this property or else bad things will happen.  The `element` getter returns the component's DOM node if mounted in the page, and `undefined` otherwise.  You are allowed to mutate that DOM node by hand however.  Just don't reassign the property on the component instance.
- **Changed**: `render` can now handle being removed and re-rendered into the DOM.  It can also handle rendering two instances of components in two different views over each other.
- **Breaking**: `_render` is renamed to `createElement` and must now return a DOM node always.  In earlier versions you could get away with not returning from `_render` and assigning nodes to `_element`.  No longer!  Also, you should move your DOM mutations into `update`.
- **Changed**: Update still works the same way: return true to run `createElement` or return false to skip a call to `createElement` when `render` is called.  If you decide to mutate `element` "by hand" on updates, do that here (rather than conditional paths inside `createElement`).
- **Changed**: `_load` and `_unload` renamed to `load` and `unload`. They have always been optional, but now the mutation observers are only added if at least one of these methods are implemented prior to component instantiation.
- **Added**: `willRender` lifecycle hook.  Its similar to `load` but runs before mounting.
- **Added**: `didUpdate` runs after `update` returns true and the results of `createElement` is mutated over the mounted component.  Useful for adjusting scroll position.
- **Fixed**: More robust unmount and remounting behavior.

#### `nanocomponent@5` to `nanocomponent@6` upgrade guide:

- Read through the new leaflet example to get an idea of the differences between the old and new API. 🗺
- Renamed `_render` to `createElement` and `_update` to `update`.
- Move any DOM mutation code from `createElement` into `update`.
- Ensure `createElement` returns a DOM node always. (You will get warnings if you don't and it probably won't work)
- Rename `_load` and `_unload` to `load` and `unload`.
- Consider moving any `load` actions into `willRender` if they don't depend on the newly rendered node being mounted in a DOM tree yet.
- Take advantage of `didUpdate` allowing you to interact with your component after `createElement` is called on mounted components 🙌

## 5.2.0
* Added more lifecycle hooks: `_willMount`, `_didMount`, `_willUpdate` in addition to `_didUpdate`.

## 5.1.0
* Update [nanomorph](http://ghub.io/nanomorph) to `^5.1.2`.  This adds the new child-reordering algorithm so we get a minor version bump.  Keep an eye out for weird ness and report broken corner cases 🙏

## 5.0.1
* Fix proxy leak by resetting proxy node ID after DOM removal is detected.

## 5.0.0
* Update [bel](http://ghub.io/bel) to ^5.0.0

## 5.0.0-1 - 2017-05-16
* Beta release!  Please let me know if there is anything wrong with this!
* **Breaking**: Remove `on-load` and use a new DOM ID based DOM tracking system.  Requires ES5 support for getters.
* **Breaking**: Remove `_load` and `_unload` methods.  You have to wrap instances of `cache-component` with `on-load` on your own now.
* **Added**: Add `_didUpdate` hook so you can call DOM methods after the component updates.  Handy for updating a scroll position.

## 4.0.2 - 2017-05-05
* Run _unload before we clear internal references, allowing you to clean up event listeners on `this._element` and anything else you want to do.

## 4.0.1 - 2017-04-10
* Fix instance clobbering bug.  This bug showed up when you had two instances of the same component morphing over each other.  This would cause the real DOM reference to get lost between the internal _element references of the two instances.  The work around was the introduction of ccId which is a unique ID to prevent this.

## 4.0.0 - 2017-04-10
* use [on-load](https://github.com/shama/on-load) to invalidate `this._element`.  Fixes component rendering when they get completely removed from the DOM.
* added `_load` and `_unload` methods to allow you to run code when the DOM is mounted and unmounted.
* handle morphing internally, and ALWAYSE return a proxy node.  There is no other way.

## 3.0.0 - 2017-04-10
* initial release

[ol]: https://github.com/shama/on-load
[cc]: https://github.com/hypermodules/cache-component
[getter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
