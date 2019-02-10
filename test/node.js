var Nanocomponent = require('../')
var test = require('tape')
var html = require('nanohtml')

test('should validate input types', (t) => {
  t.plan(1)
  var comp = new Nanocomponent()
  t.throws(comp.render.bind(comp), /createElement should be implemented/)
})

test('should render elements', (t) => {
  t.plan(2)

  function MyComp () {
    if (!(this instanceof MyComp)) return new MyComp()
    Nanocomponent.call(this)
  }
  MyComp.prototype = Object.create(Nanocomponent.prototype)

  MyComp.prototype.createElement = function (name) {
    return html`<div>${name}</div>`
  }

  MyComp.prototype.update = function (name) {
    return false
  }

  var myComp = new MyComp()

  var el1 = myComp.render('mittens')
  t.equal(String(el1), '<div>mittens</div>', 'init render success')

  var el3 = myComp.render('scruffles')
  t.equal(String(el3), '<div>scruffles</div>', 're-render success')
})
