var test = require('tape')
var SimpleComponent = require('./simple')
var Nanocomponent = require('../../')
var html = require('bel')
var compare = require('../../compare')

function makeID () {
  return 'testid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function createTestElement () {
  var testRoot = document.createElement('div')
  testRoot.id = makeID()
  document.body.appendChild(testRoot)
  return testRoot
}

test('can create a simple component', function (t) {
  var testRoot = createTestElement()

  // Create instance and mount
  var comp = new SimpleComponent('Bob')
  testRoot.appendChild(comp.render('green'))
  t.ok(comp.element, 'component created and mounted in page')
  t.equal(comp.element.querySelector('.name').innerText, 'Bob', 'instance options correctly rendered')
  t.equal(comp.element.querySelector('.color').innerText, 'green', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'not a proxy element')

  // Update mounted component and inspect proxy
  var proxy = comp.render('red')
  t.ok(proxy.dataset.proxy != null, 'proxy is returned on mounted component')
  t.equal(proxy.dataset.nanocomponent, comp._ncID, 'proxy is tagged with the correct ncID')
  t.ok(proxy.isSameNode(comp.element), 'isSameNode works')
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  comp.render('red')
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  t.end()
})

test('missing createElement', function (t) {
  function Missing () {
    if (!(this instanceof Missing)) return new Missing()
    Nanocomponent.call(this)
  }

  Missing.prototype = Object.create(Nanocomponent.prototype)

  var badMissing = new Missing()
  t.throws(badMissing.render.bind(badMissing), new RegExp(/createElement should be implemented/), 'call to render throws if createElement is missing')
  t.end()
})

test('missing update', function (t) {
  function Missing () {
    if (!(this instanceof Missing)) return new Missing()
    Nanocomponent.call(this)
  }

  Missing.prototype = Object.create(Nanocomponent.prototype)

  Missing.prototype.createElement = function () { return html`<div>hey</div>` }

  var badMissing = new Missing()
  var testRoot = createTestElement()
  testRoot.appendChild(badMissing.render())
  t.throws(badMissing.render.bind(badMissing), new RegExp(/update should be implemented/), 'call to update throws if update is missing')
  t.end()
})

test('lifecycle tests', function (t) {
  class LifeCycleComp extends Nanocomponent {
    createElement (text) {
      this.arguments = arguments
      t.pass('render ran')
      return html`<div>${text}</div>`
    }

    update (text) {
      var shouldUpdate = compare(this.arguments, arguments)
      t.pass('update ran: ' + shouldUpdate)
      return shouldUpdate
    }

    beforerender () {
      t.pass('willrender ran')
    }

    afterupdate () {
      t.pass('afterupdate ran')
    }

    load () {
      t.pass('load ran')
    }

    unload () {
      t.pass('unload ran')
    }
  }

  t.plan(8)

  var comp = new LifeCycleComp()
  var testRoot = createTestElement()
  var el = comp.render('hey')
  window.setTimeout(function () {
    testRoot.appendChild(el)
    window.setTimeout(function () {
      comp.render('hi')
      window.setTimeout(function () {
        comp.render('hi')
        window.setTimeout(function () {
          window.setTimeout(function () {
            console.log('keep alive')
            var newEl = comp.render('beep')
            t.equal(newEl.dataset.proxy, undefined, 'mounted node isn\'t a proxy')
          }, 50)
          testRoot.innerHTML = ''
        }, 50)
      }, 50)
    }, 50)
  }, 50)
})
