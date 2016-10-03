const test = require('tape')
const cacheElement = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(cacheElement)
})
