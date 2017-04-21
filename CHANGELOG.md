# cached-element Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 4.0.0 - 2017-04-10
* use [on-load](https://github.com/shama/on-load) to invalidate `this._element`.  Fixes component rendering when they get completely removed from the DOM.
* added `_load` and `_unload` methods to allow you to run code when the dom is mounted and unmounted.

## 3.0.0 - 2017-04-10
* initial release
