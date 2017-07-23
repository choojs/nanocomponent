var document = require('global/document')
var morph = require('nanomorph')
var onload = require('on-load')
var assert = require('assert')

module.exports = Nanocomponent

function makeID () {
  return 'ncid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function Nanocomponent () {
  this.hasWindow = typeof window !== 'undefined'
  this.lastArgs = [] // Copy of arguments from last render
  this._id = null // represents the id of the root node
  this._ncID = null // internal nanocomponent id
  this._proxy = null
  this._loaded = false // Used to debounce on-load when child-reordering

  this._handleLoad = this._handleLoad.bind(this)
  this._handleUnload = this._handleUnload.bind(this)

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
  if (!this.hasWindow) {
    return this.createElement.apply(this, args)
  } else if (this.element) {
    var shouldUpdate = this.update.apply(this, args)
    if (shouldUpdate) {
      this.lastArgs = args
      morph(this.element, this._handleRender(args))
      if (this.didUpdate) window.requestAnimationFrame(function () { self.didUpdate(self.element) })
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    return this._proxy
  } else {
    this._ncID = makeID()
    this.lastArgs = args
    this._proxy = null
    var el = this._handleRender(args)
    if (this.willRender) this.willRender(el)
    if (this.load || this.unload) {
      onload(el, this._handleLoad, this._handleUnload, this)
    }
    return el
  }
}

Nanocomponent.prototype._handleRender = function (args) {
  var el = this.createElement.apply(this, args)
  assert(el instanceof window.HTMLElement, 'nanocomponent: createElement should return a DOM node')
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
  if (this.load) window.requestAnimationFrame(function () { self.load() })
}

Nanocomponent.prototype._handleUnload = function () {
  var self = this
  if (this.element) return // Debounce child-reorders
  this._loaded = false
  if (this.unload) window.requestAnimationFrame(function () { self.unload() })
}

Nanocomponent.prototype.createElement = function () {
  throw new Error('nanocomponent: createElement should be implemented!')
}

Nanocomponent.prototype.update = function () {
  throw new Error('nanocomponent: update should be implemented!')
}
