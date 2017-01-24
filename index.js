var widgetEl = require('cache-element/widget')
var observeResize = require('observe-resize')
var politeEl = require('polite-element')
var cachedEl = require('cache-element')
var window = require('global/window')
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

  assert.equal(typeof render, 'function', 'nanocomponent: needs a .render function')

  var isServer = (!window.document)
  var placeholder = val.placeholder
  var onunload = val.onunload
  var _onresize = val.onresize
  var render = val.render

  var stopPlaceholderResize = null
  var stopRenderResize = null
  var unloadCalled = false

  if (isDom(val)) return staticEl(val)
  else if (typeof val === 'function') return cachedEl(val)
  else {
    if (placeholder) {
      if (_onresize && !isServer) applyPlaceholderResize()
      applyPlaceholder()
    } else {
      if (_onresize) applyResize()
      applyOnunload()
    }
    return widgetEl(val)
  }

  function applyPlaceholderResize () {
    var _placeholder = placeholder
    placeholder = function () {
      stopPlaceholderResize = observeResize(_placeholder)
    }

    var _render = render
    render = function () {
      if (stopPlaceholderResize) stopPlaceholderResize()
      stopRenderResize = observeResize(_render)
    }
  }

  function applyPlaceholder () {
    render = politeEl(placeholder, render)
  }

  function applyResize () {
    var _render = render
    render = function () {
      stopRenderResize = observeResize(_render)
    }
  }

  function applyOnunload () {
    var _onunload = onunload
    onunload = function (el) {
      if (!unloadCalled) {
        unloadCalled = true
        if (_onunload) _onunload(el)
        if (stopPlaceholderResize) stopPlaceholderResize()
        if (stopRenderResize) stopRenderResize()
      }
    }
  }
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
