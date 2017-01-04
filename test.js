var component = require('./')
var tape = require('tape')
var html = require('bel')

tape('nanocomponent', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(1)
    t.throws(component.bind(null), /DOM/)
  })

  t.test('should wrap an HTML object', function (t) {
    t.plan(1)
    var el = component(html`
      <p>hi</p>
    `)

    console.log(el)
  })
})
