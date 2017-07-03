# cached-element Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
