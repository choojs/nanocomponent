var document = require('global/document')
var assert = require('assert')

var elType = 'div'

module.exports = cacheElement

// cache an element
// (fn, fn) -> fn()
function cacheElement (createNode, compare) {
  compare = compare || defaultCompare

  assert.equal(typeof createNode, 'function', 'cache-element: createNode should be an function')
  assert.equal(typeof compare, 'function', 'cache-element: compare should be a function')

  var isProxied = false
  var element = null
  var proxy = null
  var _args = null

  // render an element
  // (any...) -> obj
  return function render () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }

    if (!element) {
      element = createNode.apply(null, args)
      _args = args
      return element
    } else {
      var isEqual = compare(args, _args)
      if (isEqual) {
        if (!isProxied) {
          proxy = document.createElement(elType)
          proxy.isSameNode = function (el) {
            return (el === element)
          }
        }
        return proxy
      } else {
        element = createNode.apply(null, args)
        isProxied = false
        _args = args
        return element
      }
    }
  }
}

function defaultCompare (args1, args2) {
  var length = args1.length
  if (length !== args2.length) return false
  for (var i = 0; i < length; i++) {
    if (args1[i] !== args2[i]) return false
  }
  return true
}
