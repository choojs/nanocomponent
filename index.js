var document = require('global/document')
var assert = require('assert')

module.exports = CacheElement

function CacheElement () {
  this._hasWindow = typeof window !== 'undefined'
  this._element = null
  this._proxy = null
  this._args = null
}

CacheElement.prototype.render = function () {
  assert.equal(typeof this._render, 'function', 'cache-element: this._render should be implemented')

  var args = new Array(arguments.length)
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i]
  }

  if (this._element && this._element.parentElement !== null) {
    var shouldUpdate = this._update.apply(this, args)
    if (shouldUpdate) {
      this._proxy = null
      this._args = args
      return this._render.apply(this, args)
    } else {
      if (!this._proxy) {
        this._proxy = this._createProxy()
      }
      return this._proxy
    }
  } else {
    this._element = this._render.apply(this, args)
    this._args = args
    return this._element
  }
}

CacheElement.prototype._createProxy = function () {
  var proxy = this._hasWindow ? document.createElement('div') : this._element
  proxy.setAttribute('data-cache-component', '')
  if (this._element && this._element.id) {
    proxy.setAttribute('id', this._element.id)
  }
  var self = this
  proxy.isSameNode = function (el) {
    window.newNode = el
    window.oldNode = self._element
    return self._element.id ? el.id === self._element.id : el.isSameNode(self._element)
  }
  return proxy
}

CacheElement.prototype._update = function () {
  var length = arguments.length
  if (length !== this._args.length) return true

  for (var i = 0; i < length; i++) {
    if (arguments[i] !== this._args[i]) return true
  }
  return false
}
