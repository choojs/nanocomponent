var document = require('global/document')
var morph = require('nanomorph')
var onload = require('on-load')
var assert = require('assert')

module.exports = CacheComponent

function makeID () {
  return 'cc-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function CacheComponent () {
  this._hasWindow = typeof window !== 'undefined'
  this._id = null // represents the id of the root node
  this._ccID = null // internal cache-component id
  this._proxy = null
  this._args = null
  this._loaded = false // Used to debounce on-load when child-reordering

  var self = this

  Object.defineProperty(this, 'element', {
    get: function () {
      var el = document.getElementById(self._id)
      if (el) return el.dataset.cacheComponent === self._ccID ? el : undefined
    }
  })
}

CacheComponent.prototype.render = function () {
  var self = this
  var args = new Array(arguments.length)
  var el
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]
  if (!this._hasWindow) {
    return this._render.apply(this, args)
  } else if (this.element) {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) {
      this._args = args
      // this._proxy = null
      el = this._handleRender(args)
      morph(this.element, el)
      if (this._didUpdate) window.requestAnimationFrame(function () { self._didUpdate() })
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    return this._proxy
  } else {
    this._ccID = makeID()
    this._args = args
    this._proxy = null
    el = this._handleRender(args)
    if (this._willRender) this._willRender(el)
    if (this._load || this._unload) {
      onload(el, this._handleLoad.bind(this), this._handleUnload.bind(this), this)
    }
    return el
  }
}

CacheComponent.prototype._handleRender = function (args) {
  var el = this._render.apply(this, args)
  assert(el instanceof window.HTMLElement, 'cache-component: _render should return a DOM node')
  return this._brandNode(this._ensureID(el))
}

CacheComponent.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = function (el) {
    return (el && el.dataset.cacheComponent === self._ccID)
  }
  return proxy
}

CacheComponent.prototype._brandNode = function (node) {
  node.setAttribute('data-cache-component', this._ccID)
  return node
}

CacheComponent.prototype._ensureID = function (node) {
  if (node.id) this._id = node.id
  else node.id = this._id = this._ccID
  return node
}

CacheComponent.prototype._handleLoad = function () {
  var self = this
  if (this._loaded) return // Debounce child-reorders
  this._loaded = true
  if (this._load) window.requestAnimationFrame(function () { self._load() })
}

CacheComponent.prototype._handleUnload = function () {
  var self = this
  if (this.element) return // Debounce child-reorders
  this._loaded = false
  if (this._unload) window.requestAnimationFrame(function () { self._unload() })
}

CacheComponent.prototype._render = function () {
  throw new Error('cache-component: _render should be implemented!')
}

CacheComponent.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
