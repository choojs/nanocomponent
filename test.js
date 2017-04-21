var CacheComponent = require('./')
var test = require('tape')
var html = require('bel')

test('cache', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(1)
    var comp = new CacheComponent()
    t.throws(comp.render.bind(comp), /_render should be implemented/)
  })

  t.skip('should render elements', (t) => {
    t.plan(3)

    function MyComp () {
      if (!(this instanceof MyComp)) return new MyComp()
      CacheComponent.call(this)
    }
    MyComp.prototype = Object.create(CacheComponent.prototype)

    MyComp.prototype._render = function (name) {
      return html`
        <div>${name}</div>
      `
    }

    var myComp = new MyComp()

    var el1 = myComp.render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    var el2 = myComp.render('mittens')
    var same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')

    var el3 = myComp.render('scruffles')
    t.equal(String(el3), '<div>scruffles</div>', 're-render success')
  })

  t.skip('should accept a custom compare function', (t) => {
    t.plan(2)
    function MyComp () {
      if (!(this instanceof MyComp)) return new MyComp()
      CacheComponent.call(this)
    }
    MyComp.prototype = Object.create(CacheComponent.prototype)

    MyComp.prototype._render = function (name) {
      return html`
        <div>${name}</div>
      `
    }

    MyComp.prototype._update = function (arg1) {
      return arg1 !== 'humans!'
    }

    var myComp = new MyComp()

    var el1 = myComp.render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    var el2 = myComp.render('humans!')
    var same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')
  })
})
