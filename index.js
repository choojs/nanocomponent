var document = require('global/document')
var morph = require('nanomorph')

module.exports = CacheComponent

function makeId () {
  return 'cc-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function CacheComponent () {
  this._hasWindow = typeof window !== 'undefined'
  this._proxy = null
  this._args = null
  this._ccId = null
  this._id = null

  var self = this

  Object.defineProperty(this, '_element', {
    get: function () {
      var el = document.getElementById(self._id)
      if (el) return el.dataset.cacheComponent === self._ccId ? el : undefined
    }
  })
}

CacheComponent.prototype.render = function () {
  var args = new Array(arguments.length)
  for (var i = 0; i < arguments.length; i++) args[i] = arguments[i]
  if (!this._hasWindow) {
    return this._render.apply(this, args)
  } else if (this._element) {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) {
      this._args = args
      this._proxy = null
      morph(this._element, this._brandNode(this._handleId(this._render.apply(this, args))))
      if (this._didUpdate) window.requestAnimationFrame(function () { this._didUpdate() })
    }
    if (!this._proxy) { this._proxy = this._createProxy() }
    return this._proxy
  } else {
    this._ccId = makeId()
    this._args = args
    return this._brandNode(this._handleId(this._render.apply(this, args)))
  }
}

CacheComponent.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  var self = this
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = function (el) {
    return (el && el.dataset.cacheComponent === self._ccId)
  }
  return proxy
}

CacheComponent.prototype._brandNode = function (node) {
  node.setAttribute('data-cache-component', this._ccId)
  return node
}

CacheComponent.prototype._handleId = function (node) {
  if (node.id) {
    this._id = node.id
  } else {
    node.id = this._id = this._ccId
  }
  return node
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
