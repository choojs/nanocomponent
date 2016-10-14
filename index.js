const document = require('global/document')
const assert = require('assert')

const elType = 'div'

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

  // render an element
  // (any...) -> obj
  return function render () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }

    if (!element) {
      element = createNode.apply(null, args)
      return element
    } else {
      const isEqual = compare.apply(null, args)
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
        return element
      }
    }
  }
}

// strict equal compare two arguments
// (any, any) -> bool
function defaultCompare (curr, prev) {
  if (curr && !prev) return true
  return (curr === prev)
}
