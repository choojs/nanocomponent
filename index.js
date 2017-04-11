var onload = require('on-load')
var assert = require('assert')

module.exports = Nanocomponent

function Nanocomponent (opts) {
  this._hasWindow = typeof window !== 'undefined'
  this._placeholder = null
  this._onload = onload
  this._element = null
  this._loaded = false
  this.state = {}
  this.props = {}
  this.oldProps = {}

  if (opts && opts.pure) this._update = defaultUpdate
}

Nanocomponent.prototype.render = function (props) {
  assert.equal(typeof this._render, 'function', 'nanocomponent: this._render should be implemented')
  assert.equal(typeof this._update, 'function', 'nanocomponent: this._update should be implemented')

  var self = this

  if (this._hasWindow && this._element) {
    var shouldUpdate = this._update(props)
    if (shouldUpdate) {
      this.oldProps = this.props
      this.props = props
      this._render()
    }
    if (!this._placeholder) this._placeholder = this._createPlaceholder()
    return this._placeholder
  } else {
    this.oldProps = this.props
    this.props = props
    this._element = this._render()

    if (!this._hasWindow) return this._element
    this._onload(this._element, function () {
      self._loaded = true
      if (self._load) {
        window.requestAnimationFrame(function () {
          self._load()
        })
      }
    }, function () {
      self._placeholder = null
      self._element = null
      self._loaded = false
      if (self._unload) {
        window.requestAnimationFrame(function () {
          self._unload()
        })
      }
    })
    return this._element
  }
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

function defaultUpdate (newProps) {
  const propsKeys = Object.keys(this.props)
  const newPropsKeys = Object.keys(newProps)
  if (propsKeys.length !== newPropsKeys.length) return true
  for (var i = 0; i < propsKeys.length; i++) {
    if (this.props[propsKeys[i]] !== newProps[propsKeys[i]]) return true
  }
  return false
}
