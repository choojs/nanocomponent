var document = require('global/document')
var nanotiming = require('nanotiming')
var morph = require('nanomorph')
var onload = require('on-load')
var assert = require('assert')

module.exports = Nanocomponent

function makeID () {
  return 'ncid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function Nanocomponent (name) {
  this._hasWindow = typeof window !== 'undefined'
  this._id = null // represents the id of the root node
  this._ncID = null // internal nanocomponent id
  this._proxy = null
  this._loaded = false // Used to debounce on-load when child-reordering
  this._rootNodeName = null
  this._name = name || 'nanocomponent'
  this._rerender = false

  this._handleLoad = this._handleLoad.bind(this)
  this._handleUnload = this._handleUnload.bind(this)

  this._arguments = []

  var self = this

  Object.defineProperty(this, 'element', {
    get: function () {
      var el = document.getElementById(self._id)
      if (el) return el.dataset.nanocomponent === self._ncID ? el : undefined
    }
  })
}

Nanocomponent.prototype.render = function () {
  var timing = nanotiming(this._name + '.render')
  var self = this
  var args = new Array(arguments.length)
  var el
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]
  if (!this._hasWindow) {
    el = this.createElement.apply(this, args)
    timing()
    return el
  } else if (this.element) {
    var shouldUpdate = this._rerender || this.update.apply(this, args)
    if (this._rerender) this._render = false
    if (shouldUpdate) {
      morph(this.element, this._handleRender(args))
      if (this.afterupdate) this.afterupdate(this.element)
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    timing()
    return this._proxy
  } else {
    this._reset()
    el = this._handleRender(args)
    if (this.beforerender) this.beforerender(el)
    if (this.load || this.unload || this.afterrreorder) {
      onload(el, self._handleLoad, self._handleUnload, self)
    }
    timing()
    return el
  }
}

Nanocomponent.prototype.rerender = function () {
  assert(this.element, 'nanocomponent: cant rerender on an unmounted dom node')
  this._rerender = true
  this.render.apply(this, this._arguments)
}

Nanocomponent.prototype._handleRender = function (args) {
  var el = this.createElement.apply(this, args)
  if (!this._rootNodeName) this._rootNodeName = el.nodeName
  assert(el instanceof window.HTMLElement, 'nanocomponent: createElement should return a DOM node')
  assert.equal(this._rootNodeName, el.nodeName, 'nanocomponent: root node types cannot differ between re-renders')
  this._arguments = args
  return this._brandNode(this._ensureID(el))
}

Nanocomponent.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.setAttribute('data-proxy', '')
  proxy.isSameNode = function (el) {
    return (el && el.dataset.nanocomponent === self._ncID)
  }
  return proxy
}

Nanocomponent.prototype._reset = function () {
  this._ncID = makeID()
  this._id = null
  this._proxy = null
  this._rootNodeName = null
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

Nanocomponent.prototype._handleLoad = function (el) {
  var self = this
  if (this._loaded) {
    if (this.afterreorder) window.requestAnimationFrame(function () { self.afterreorder(el) })
    return // Debounce child-reorders
  }
  this._loaded = true
  if (this.load) window.requestAnimationFrame(function () { self.load(el) })
}

Nanocomponent.prototype._handleUnload = function (el) {
  var self = this
  if (this.element) return // Debounce child-reorders
  this._loaded = false
  if (this.unload) window.requestAnimationFrame(function () { self.unload(el) })
}

Nanocomponent.prototype.createElement = function () {
  throw new Error('nanocomponent: createElement should be implemented!')
}

Nanocomponent.prototype.update = function () {
  throw new Error('nanocomponent: update should be implemented!')
}
