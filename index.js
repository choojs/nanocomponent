var document = require('global/document')
var morph = require('nanomorph')
var onload = require('on-load')
var assert = require('assert')

module.exports = Nanocomponent

function makeID () {
  return 'ncid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function Nanocomponent () {
  this._hasWindow = typeof window !== 'undefined'
  this._id = null // represents the id of the root node
  this._ncID = null // internal nanocomponent id
  this._proxy = null
  this._args = null
  this._loaded = false // Used to debounce on-load when child-reordering

  var self = this

  Object.defineProperty(this, 'element', {
    get: function () {
      var el = document.getElementById(self._id)
      if (el) return el.dataset.nanocomponent === self._ncID ? el : undefined
    }
  })
}

Nanocomponent.prototype.render = function () {
  var self = this
  var args = new Array(arguments.length)
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]
  if (!this._hasWindow) {
    return this._render.apply(this, args)
  } else if (this.element) {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) {
      this._args = args
      morph(this.element, this._handleRender(args))
      if (this._didUpdate) window.requestAnimationFrame(function () { self._didUpdate() })
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    return this._proxy
  } else {
    this._ncID = makeID()
    this._args = args
    this._proxy = null
    var el = this._handleRender(args)
    if (this._willRender) this._willRender(el)
    if (this._load || this._unload) {
      onload(el, this._handleLoad.bind(this), this._handleUnload.bind(this), this)
    }
    return el
  }
}

Nanocomponent.prototype._handleRender = function (args) {
  var el = this._render.apply(this, args)
  assert(el instanceof window.HTMLElement, 'nanocomponent: _render should return a DOM node')
  return this._brandNode(this._ensureID(el))
}

Nanocomponent.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = function (el) {
    return (el && el.dataset.nanocomponent === self._ncID)
  }
  return proxy
}

Nanocomponent.prototype._brandNode = function (node) {
  node.setAttribute('data-nanocomponent', this._ncID)
  return node
}

Nanocomponent.prototype._ensureID = function (node) {
  if (node.id) this._id = node.id
  else node.id = this._id = this._ncID
  return node
}

Nanocomponent.prototype._handleLoad = function () {
  var self = this
  if (this._loaded) return // Debounce child-reorders
  this._loaded = true
  if (this._load) window.requestAnimationFrame(function () { self._load() })
}

Nanocomponent.prototype._handleUnload = function () {
  var self = this
  if (this.element) return // Debounce child-reorders
  this._loaded = false
  if (this._unload) window.requestAnimationFrame(function () { self._unload() })
}

Nanocomponent.prototype._render = function () {
  throw new Error('nanocomponent: _render should be implemented!')
}

Nanocomponent.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
