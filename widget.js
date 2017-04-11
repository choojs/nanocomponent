var document = require('global/document')
var onload = require('on-load')
var assert = require('assert')

var elType = 'div'

module.exports = widgetify

// turn an element into a widget
// (obj, fn?) -> fn(any) -> DOMElement
function widgetify (methods, compare) {
  compare = compare || defaultCompare

  assert.equal(typeof methods, 'object', 'cache-element/widget: methods should be an object')
  assert.equal(typeof methods.render, 'function', 'cache-element/widget: methods.render should be a function')
  assert.equal(typeof compare, 'function', 'cache-element/widget: compare should be a function')

  var _onupdate = methods.onupdate || noop
  var _onunload = methods.onunload || noop
  var _onload = methods.onload || noop
  var _render = methods.render

  var _isProxied = false
  var _element = null
  var _proxy = null
  var _args = null

  return function () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    if (!_args) _args = args

    if (!_element) {
      _element = _render.apply(null, args)

      // apply lifecycle hooks
      // TODO: also call _element's onunload function
      onload(_element, _onload, function (el) {
        _isProxied = false
        _element = null
        _proxy = null

        _onunload(el)
      })

      return _element
    } else {
      if (!_isProxied) {
        _proxy = document.createElement(elType)
        _proxy.isSameNode = function (el) {
          return (el === _element)
        }
      }
      if (_onupdate && !compare(_args, args)) {
        var copy = args.slice(0)
        copy.unshift(_element) // add element as first arg
        _onupdate.apply(null, copy)
        _args = args
      }
      return _proxy
    }
  }
}

function noop () {}

function defaultCompare (args1, args2) {
  var length = args1.length
  if (length !== args2.length) return false
  for (var i = 0; i < length; i++) {
    if (args1[i] !== args2[i]) return false
  }
  return true
}
