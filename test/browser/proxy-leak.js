var test = require('tape')
var morph = require('nanomorph')
var Nanocomponent = require('../../')
var html = require('bel')

function isProxy (node) {
  return node.dataset.proxy !== undefined
}

class Component extends Nanocomponent {
  createElement () {
    return html`<div>I'm a component</div>`
  }

  update () {
    return false
  }
}

function makeID () {
  return 'testid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function createTestElement () {
  var testRoot = document.createElement('div')
  testRoot.id = makeID()
  document.body.appendChild(testRoot)
  return testRoot
}

test('should not leak proxy nodes', t => {
  var testRoot = createTestElement()
  var component = new Component()
  var view = viewA()
  var newView

  function viewA () {
    return html`
      <body>
        <a href="/">beep</a>
        <a href="/boop">boop</a>
        <div>
          ${component.render()}
        </div>
      </body>
    `
  }

  function viewB () {
    return html`
      <body>
        <a href="/">beep</a>
        <a href="/boop">boop</a>
        ${component.render()}
      </body>
    `
  }

  testRoot.appendChild(view)
  newView = morph(view, viewB())
  t.notOk(isProxy(newView.children[2]), 'proxy node has not been leaked')
  t.end()
})
