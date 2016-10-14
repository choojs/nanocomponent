const document = require('global/document')
const onload = require('on-load')
const assert = require('assert')
const noop = require('noop2')

const elType = 'div'

module.exports = widgetizeElement

// turn an element into a widget
// (fn) -> fn(fn(fn(any...)))
function widgetizeElement (createNode) {
  assert.equal(typeof createNode, 'function', 'cache-element/widget: createNode should be an function')

  var isProxied = false
  var sendUpdate = false
  var element = null
  var proxy = null

  return function render () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }

    if (!element) {
      element = createNode(update)
      assert.equal(typeof element, 'object', 'cache-element/widget: element should be an object')

      // reset elements when el is dismounted
      onload(element, noop, function onunload (el) {
        isProxied = false
        sendUpdate = false
        element = null
        proxy = null
      })

      if (sendUpdate) sendUpdate(args)
      return element
    } else {
      if (!isProxied) {
        proxy = document.createElement(elType)
        proxy.isSameNode = function (el) {
          return (el === element)
        }
      }
      if (sendUpdate) sendUpdate(args)
      return proxy
    }
  }

  // (fn) -> null
  function update (onupdate) {
    assert.equal(typeof onupdate, 'function', 'cache-element/widget: onupdate should be a function')
    sendUpdate = onupdate
  }
}
