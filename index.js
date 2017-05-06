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
  this._ccId = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

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
  } else if (this._element) {
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
    this._brandNode(this._element)
    onload(this._element, this._handleLoad, this._handleUnload, this)
    return this._element
  }
}

CacheElement.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  this._brandNode(proxy)
  proxy.isSameNode = function (el) { return (el.dataset && el.dataset.cacheComponent === self._ccId) || el === self._element }
  return proxy
}

CacheElement.prototype._brandNode = function (node) {
  node.setAttribute('data-cache-component', this._ccId)
}

CacheElement.prototype._handleLoad = function () {
  var self = this
  if (this._load) window.requestAnimationFrame(function () { self._load() })
}

CacheElement.prototype._handleUnload = function () {
  var self = this
  if (this._unload) {
    window.requestAnimationFrame(function () {
      self._unload()
      self._proxy = null
      self._element = null
    })
  } else {
    this._proxy = null
    this._element = null
  }
}

CacheElement.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
