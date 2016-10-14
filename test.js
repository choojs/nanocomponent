const test = require('tape')
const cacheElement = require('./')

test('cache', function (t) {
  t.plan(7)

  // ensure memoization
  var callCount = 0
  var render = cacheElement(function (el) {
    callCount += 1
    return el
  })

  t.equals(callCount, 0)
  t.same(render('alice'), 'alice')
  t.equals(callCount, 1)
  t.same(render('alice'), 'alice')
  t.equals(callCount, 1)

  t.same(render('bob'), 'bob')
  t.equals(callCount, 2)
})

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(cacheElement)
})
