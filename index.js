'use strict'

const assert = require('assert')
module.exports = cacheElement

const __slice = Function.prototype.call.bind(Array.prototype.slice)

function cacheElement (fn) {
  assert(typeof fn === 'function', 'cacheElement accepts one argument, which must be a `function`')
  const store = {}

  return function render () {
    const args = __slice(arguments, 0)
    let argsAreTheSame = !!store.prev
    for (let i = 0; i < (store.prev || []).length; ++i) {
      // not `break`ing cause I don't think users will pass a million args
      argsAreTheSame = argsAreTheSame && store.prev[i] === args[i]
    }

    if (argsAreTheSame) return store.el

    store.prev = args
    store.el = fn.apply(this, args)
    return store.el
  }
}
