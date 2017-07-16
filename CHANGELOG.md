# nanocomponent Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 6.0.0 - DATE HERE

🎉 nanocomponent and cache-component are merged into one module: `nanocomponent@6.0.0` 🎉.

Be sure to read the new README so that you get an understanding of the new API, but here is a quick summary of what has changed from the perspective of both modules:

### Changes since cache-component@5

`nanocomponent@6` is mostly the same as `cache-component@5` except for the following:

- **Breaking**: The `_element` getter is renamed to `element`.
- **Breaking**: `_willMount` is renamed to `_willRender` because DOM mounting can't be guaranteed from the perspective of a component.
- **Breaking**: `_didMount` is removed.  If you want this hook still, you can just call `window.requestAnimationFrame` from `_willRender`.
- **Breaking**: `_willUpdate` is removed.  Anything you can do in `_willUpdate` you can just move to `_update`.
- **Breaking**: `_update` should always be implemented.  Instead of a shallow compare, the default `_update` now always returns `true` causing full component renders.
- **Changed**: `_didUpdate()` now receives an element argument `el` e.g. `_didUpdate(el)`.  This makes it consistent with the other life-cycle methods. `this.element` is passed to `_didUpdate()`, whereas the other life-cycle methods have direct references to a freshly rendered DOM instance.  This means that it can sometimes be null, so you need to protect for that, the same way you did when directly accessing `this.element` in this hook.
- **Added**: Added [on-load][ol] hooks `_load` and `_unload`.  [on-load][ol] listeners only get added when one or both of the hooks are implemented on a component making the mutation observers optional.


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
* **Breaking**: Remove `on-load` and use a new dom ID based dom tracking system.  Requires ES5 support for getters.
* **Breaking**: Remove `_load` and `_unload` methods.  You have to wrap instances of `cache-component` with `on-load` on your own now.
* **Added**: Add `_didUpdate` hook so you can call dom methods after the component updates.  Handy for updating a scroll position.

## 4.0.2 - 2017-05-05
* Run _unload before we clear internal references, allowing you to clean up event listeners on `this._element` and anything else you want to do.

## 4.0.1 - 2017-04-10
* Fix instance clobbering bug.  This bug showed up when you had two instances of the same component morphing over each other.  This would cause the real DOM reference to get lost between the internal _element references of the two instances.  The work around was the introduction of ccId which is a unique ID to prevent this.

## 4.0.0 - 2017-04-10
* use [on-load](https://github.com/shama/on-load) to invalidate `this._element`.  Fixes component rendering when they get completely removed from the DOM.
* added `_load` and `_unload` methods to allow you to run code when the dom is mounted and unmounted.
* handle morphing internally, and ALWAYSE return a proxy node.  There is no other way.

## 3.0.0 - 2017-04-10
* initial release
