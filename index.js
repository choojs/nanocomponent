var document = require('global/document')
var assert = require('assert')
var onload = require('on-load')
var nanomorph = require('nanomorph')

module.exports = CacheElement

function CacheElement () {
  this._hasWindow = typeof window !== 'undefined'
  this._element = null
  this._proxy = null
  this._args = null

  this._handleLoad = this._handleLoad.bind(this)
  this._handleUnload = this._handleUnload.bind(this)
}

CacheElement.prototype.render = function () {
  assert.equal(typeof this._render, 'function', 'cache-element: this._render should be implemented')

  var args = new Array(arguments.length)
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]

  if (!this._hasWindow) {
    this._element = this._render.apply(this, args)
    return this._element
  } if (this._element) {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) {
      this._args = args
      nanomorph(this._element, this._render.apply(this, args))
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    return this._proxy
  } else {
    this._element = this._render.apply(this, args)
    this._args = args
    if (this._hasWindow) onload(this._element, this._handleLoad, this._handleUnload)
    return this._element
  }
}

CacheElement.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  proxy.setAttribute('data-cache-component', '')
  proxy.isSameNode = function (el) { return el === self._element }
  return proxy
}

CacheElement.prototype._handleLoad = function () {
  var self = this
  if (this._load) window.requestAnimationFrame(function () { self._load() })
}

CacheElement.prototype._handleUnload = function () {
  var self = this
  this._proxy = null
  this._element = null
  if (this._unload) window.requestAnimationFrame(function () { self._unload() })
}

CacheElement.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
