var widgetEl = require('cache-element/widget')
var politeEl = require('polite-element')
var cachedEl = require('cache-element')
var onload = require('on-load')
var assert = require('assert')
var isDom = require('is-dom')

var elType = 'div'

module.exports = nanocomponent

// Create performant HTML elements
// (DOMElement|fn|obj) -> fn
function nanocomponent (val) {
  assert.ok(isDom(val) || (typeof val === 'object') || typeof val === 'function', 'nanocomponent: val should be a valid DOM node, type Object or type Function')

  if (isDom(val)) return staticEl(val)
  if (typeof val === 'function') return cachedEl(val)

  if (val.placeholder) {
    assert.equal(typeof val.render, 'function', 'nanocomponent: .placeholder cannot exist without a .render method')
    val.render = politeEl(val.placeholder, val.render)

    if (val.onunload) {
      var onunload = val.onunload
      var unloadCalled = false
      val.onunload = function (el) {
        if (!unloadCalled) {
          unloadCalled = true
        } else {
          onunload(el)
        }
      }
    }
  }

  return widgetEl(val)
}

function staticEl (element) {
  var isRendered = false
  var isProxied = false
  var proxy = null

  onload(element, handleLoad, handleUnload)

  return function render () {
    if (!isRendered) {
      return element
    } else if (!isProxied) {
      proxy = document.createElement(elType)
      proxy.isSameNode = function (el) {
        return (el === element)
      }
    }
    return proxy
  }

  function handleLoad () {
    isRendered = true
  }

  function handleUnload () {
    isProxied = false
    proxy = null
  }
}
