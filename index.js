var nanotask = require('nanotask')
var onload = require('on-load')
var assert = require('assert')

module.exports = Nanocomponent

function Nanocomponent (val) {
  this._hasWindow = typeof window !== undefined
  this._queue = nanotask()
  this._placeholder = null
  this._onload = onload
  this._element = null
  this._loaded = false
}

Nanocomponent.prototype.render = function () {
  assert.equal(typeof this._render, 'function', 'nanocomponent: this._render should be implemented')

  var self = this
  var len = arguments.length
  var args = new Array(len)
  for (var i = 0; i < len; i++) args[i] = arguments[i]

  if (!this._hasWindow) {
    this._element = this._render.apply(this, args)
    return this._element
  } else if (!this._element) {
    this._element = this._render.apply(this, args)
    this._onload(this._element, function () {
      self._loaded = true
      if (self._load) {
        self._queue(function () {
          self._load()
        })
      }
    }, function () {
      self._placeholder = null
      self._element = null
      self._loaded = false
      if (self._unload) {
        self._queue(function () {
          self._unload()
        })
      }
    })
    return this._element
  } else {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) this._render.apply(this, args)
    if (!this._placeholder) this._placeholder = this._createPlaceholder()
    return this._placeholder
  }
}

// default ._update method - should be replaced with custom logic
Nanocomponent.prototype._update = function () {
  return true
}

Nanocomponent.prototype._createPlaceholder = function () {
  var el = document.createElement('div')
  el.setAttribute('data-nanocomponent', '')
  var self = this
  el.isSameNode = function (el) {
    return el === self._element
  }
  return el
}
