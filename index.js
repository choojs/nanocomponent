var observeResize = require('observe-resize')
var onIntersect = require('on-intersect')
var politeEl = require('polite-element')
var onload = require('on-load')
var assert = require('assert')
var isDom = require('is-dom')
var html = require('bel')

module.exports = nanocomponent

// Create performant HTML elements
// (DOMElement|fn|obj) -> fn
function nanocomponent (val) {
  assert.ok(isDom(val) || (typeof val === 'object') || typeof val === 'function', 'nanocomponent: val should be a valid DOM node, type Object or type Function')

  if (isDom(val)) return createStaticElement(val)
  if (typeof val === 'function') return createDynamicElement(val)

  assert.equal(typeof val.render, 'function', 'nanocomponent: needs a .render function')

  var placeholderHandler = val.placeholder
  var onunloadHandler = val.onunload
  var onresizeHandler = val.onresize
  var onenterHandler = val.onenter
  var onexitHandler = val.onexit
  var onloadHandler = val.onload
  var renderHandler = val.render

  var stopPlaceholderResize = null
  var stopRenderResize = null
  var enableIntersect = null
  var enableResize = null

  if (isDom(val)) return createStaticElement(val)
  else if (typeof val === 'function') return createDynamicElement(val)
  else {
    if (onresizeHandler) applyResize()
    if (onenterHandler || onexitHandler) applyOnintersect()
    applyOnloadhandler()
    if (placeholderHandler) applyPlaceholder()
    return renderHandler
  }

  function applyOnloadhandler () {
    var _render = renderHandler
    createOnunload()
    createOnload()
    renderHandler = createDynamicElement(_render, onloadHandler, onunloadHandler)
  }

  function applyOnintersect () {
    enableIntersect = function (el) {
      onIntersect(el, onenterHandler, onexitHandler)
    }
  }

  function applyPlaceholder () {
    var _render = renderHandler
    renderHandler = function () {
      var args = new Array(arguments.length)
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i]
      }
      var el = politeEl(placeholderHandler, _render)
      var ret = el.apply(el, args)
      return ret
    }
  }

  function applyResize () {
    enableResize = function (el) {
      stopRenderResize = observeResize(el, onresizeHandler)
    }
  }

  function createOnunload () {
    var _onunload = onunloadHandler
    onunloadHandler = function (el) {
      if (stopPlaceholderResize) {
        stopPlaceholderResize()
        stopPlaceholderResize = null
      }
      if (stopRenderResize) {
        stopRenderResize()
        stopRenderResize = null
      }
      if (_onunload) _onunload(el)
    }
  }

  function createOnload () {
    var _onload = onloadHandler
    onloadHandler = function (el) {
      if (_onload) _onload(el)
      if (enableResize) enableResize(el)
      if (enableIntersect) enableIntersect(el)
    }
  }
}

function createStaticElement (element) {
  var isRendered = false
  var isProxied = false
  var proxy = null

  onload(element, handleLoad, handleUnload)

  return function render () {
    if (!isRendered) {
      return element
    } else if (!isProxied) {
      proxy = html`<div></div>`
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

function createDynamicElement (render, _onload, _onunload) {
  var isRendered = false
  var isProxied = false
  var element = null
  var proxy = null
  var args = null

  return function () {
    var _args = new Array(arguments.length)
    for (var i = 0; i < _args.length; i++) {
      _args[i] = arguments[i]
    }

    if (!isRendered) {
      args = _args
      element = render.apply(render, args)
      onload(element, handleLoad, handleUnload)
      return element
    } else {
      if (!compare(_args, args)) {
        element = render.apply(render, args)
        onload(element, handleLoad, handleUnload)
        return element
      } else if (!isProxied) {
        proxy = html`<div></div>`
        proxy.isSameNode = function (el) {
          return (el === element)
        }
      } else {
        return proxy
      }
    }
  }

  function handleLoad (el) {
    isRendered = true
    if (_onload) _onload(el)
  }

  function handleUnload (el) {
    isProxied = false
    proxy = null
    if (_onunload) _onunload(el)
  }
}

function compare (args1, args2) {
  var length = args1.length
  if (length !== args2.length) return false
  for (var i = 0; i < length; i++) {
    if (args1[i] !== args2[i]) return false
  }
  return true
}
