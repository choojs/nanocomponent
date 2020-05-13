var test = require('tape')
var SimpleComponent = require('./simple')
var BlogSection = require('./blog-section')
var Nanocomponent = require('../../')
var html = require('nanohtml')
var compare = require('../../compare')
var nanobus = require('nanobus')

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
  var comp = new SimpleComponent('yosh')
  testRoot.appendChild(comp.render('green'))
  t.ok(comp.element, 'component created and mounted in page')
  t.equal(comp.element.querySelector('.name').innerText, 'yosh', 'instance options correctly rendered')
  t.equal(comp.element.querySelector('.color').innerText, 'green', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'not a proxy element')

  // Update mounted component and inspect proxy
  var proxy = comp.render('red')
  t.ok(proxy.dataset.proxy != null, 'proxy is returned on mounted component')
  t.equal(proxy.dataset.nanocomponent, comp._ncID, 'proxy is tagged with the correct ncID')
  t.equal(proxy.nodeName, comp.element.nodeName, 'proxy is of same type')
  t.ok(proxy.isSameNode(comp.element), 'isSameNode works')
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  comp.render('red')
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  comp.name = 'lrlna' // Update internal state
  comp.rerender()
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.name').innerText, 'lrlna', 'instance options correctly rerendered')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'internal state reflected in rerender')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  t.end()
})

test('proxy node types match the root node returned from createElement', function (t) {
  var testRoot = createTestElement()
  var comp = new BlogSection()
  testRoot.appendChild(comp.render(['hey', 'hi', 'howdy']))
  t.ok(comp.element, 'component created and mounted in page')
  t.equal(comp.element.nodeName, 'SECTION', 'correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'not a proxy element')

  var proxy = comp.render(['by', 'bye', 'cya'])
  t.equal(proxy.nodeName, comp.element.nodeName, 'proxy is of same type as the root node of createElement')

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
  var testRoot = createTestElement()
  class LifeCycleComp extends Nanocomponent {
    constructor () {
      super()
      this.bus = nanobus()
      this.testState = {
        'create-element': 0,
        update: 0,
        beforerender: 0,
        afterupdate: 0,
        load: 0,
        unload: 0
      }
    }

    createElement (text) {
      this.arguments = arguments
      this.testState['create-element']++
      return html`<div>${text}</div>`
    }

    update (text) {
      var shouldUpdate = compare(this.arguments, arguments)
      this.testState.update++
      return shouldUpdate
    }

    beforerender () {
      this.testState.beforerender++
    }

    afterupdate () {
      this.testState.afterupdate++
    }

    load () {
      this.testState.load++
      this.bus.emit('load')
    }

    unload () {
      this.testState.unload++
      this.bus.emit('unload')
    }
  }

  var comp = new LifeCycleComp()
  comp.bus.on('load', () => window.requestAnimationFrame(onLoad))
  comp.bus.on('unload', () => window.requestAnimationFrame(onUnload))

  t.deepEqual(comp.testState, {
    'create-element': 0,
    update: 0,
    beforerender: 0,
    afterupdate: 0,
    load: 0,
    unload: 0
  }, 'no lifecycle methods run on instantiation')
  var el = comp.render('hey')
  t.deepEqual(comp.testState, {
    'create-element': 1,
    update: 0,
    beforerender: 1,
    afterupdate: 0,
    load: 0,
    unload: 0
  }, 'create-element and beforerender is run on first render')

  testRoot.appendChild(el)

  function onLoad () {
    t.deepEqual(comp.testState, {
      'create-element': 1,
      update: 0,
      beforerender: 1,
      afterupdate: 0,
      load: 1,
      unload: 0
    }, 'component loaded')

    comp.render('hi')

    t.deepEqual(comp.testState, {
      'create-element': 2,
      update: 1,
      beforerender: 1,
      afterupdate: 1,
      load: 1,
      unload: 0
    }, 'component re-rendered')

    comp.render('hi')

    t.deepEqual(comp.testState, {
      'create-element': 2,
      update: 2,
      beforerender: 1,
      afterupdate: 1,
      load: 1,
      unload: 0
    }, 'component cache hit')

    testRoot.removeChild(comp.element)
  }

  function onUnload () {
    t.equal(comp.element, undefined, 'component unmounted')
    t.end()
  }
})
