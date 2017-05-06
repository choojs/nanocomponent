# cached-element Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 4.0.2 - 2017-05-05
* Run _unload before we clear internal references, alowing you to clean up event listeners on `this._element` and anything else you want to do.

## 4.0.1 - 2017-04-10
* Fix instance clobbering bug.  This bug showed up when you had two instances of the same component morphing over each other.  This would cause the real DOM reference to get lost between the internal _element references of the two instances.  The work around was the introduction of ccId which is a unique ID to prevent this.

## 4.0.0 - 2017-04-10
* use [on-load](https://github.com/shama/on-load) to invalidate `this._element`.  Fixes component rendering when they get completely removed from the DOM.
* added `_load` and `_unload` methods to allow you to run code when the dom is mounted and unmounted.
* handle morphing internally, and ALWAYSE return a proxy node.  There is no other way.

## 3.0.0 - 2017-04-10
* initial release
