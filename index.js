var observeResize = require('observe-resize')
var onIntersect = require('on-intersect')
var politeEl = require('polite-element')
var onload = require('on-load')
var assert = require('assert')
var html = require('bel')

module.exports = nanocomponent

// Create performant HTML elements
// (DOMElement|fn|obj) -> fn
function nanocomponent (val) {
  assert.equal(typeof val, 'object', 'nanocomponent: val should type function')
  assert.equal(typeof val.render, 'function', 'nanocomponent: needs a .render function')

  var placeholderHandler = val.placeholder
  var onunloadHandler = val.onunload
  var onresizeHandler = val.onresize
  var onenterHandler = val.onenter
  var updateHandler = val.onupdate
  var onexitHandler = val.onexit
  var onloadHandler = val.onload
  var renderHandler = val.render

  var stopPlaceholderResize = null
  var stopRenderResize = null
  var enableIntersect = null
  var enableResize = null

  if (onresizeHandler) applyResize()
  if (onenterHandler || onexitHandler) applyOnintersect()
  applyOnloadhandler()
  if (placeholderHandler) applyPlaceholder()
  return renderHandler

  function applyOnloadhandler () {
    var _render = renderHandler
    createOnunload()
    createOnload()
    renderHandler = createElement(_render, updateHandler, onloadHandler, onunloadHandler)
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

function createElement (render, update, _onload, _onunload) {
  var isRendered = false
  var isMounted = false
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
      isRendered = true
      args = _args
      element = render.apply(render, args)
      onload(element, handleLoad, handleUnload)
    }

    if (!isMounted) return element
    if (!compare(_args, args)) {
      args = _args
      if (update) {
        // call update with element as the first arg
        args.unshift(element)
        update.apply(render, args.slice(0))
      }
    }

    if (!isProxied) {
      proxy = html`<div></div>`
      proxy.isSameNode = function (el) {
        return (el === element)
      }
    }

    return proxy
  }

  function handleLoad (el) {
    isMounted = true
    if (_onload) _onload(el)
  }

  function handleUnload (el) {
    isMounted = false
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
