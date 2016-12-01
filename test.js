var cacheElement = require('./')
var widget = require('./widget')
var morph = require('nanomorph')
var test = require('tape')
var html = require('bel')

test('cache', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(2)
    t.throws(cacheElement.bind(null, 123), /function/)
    t.throws(cacheElement.bind(null, () => {}, 123), /function/)
  })

  t.test('should render elements', (t) => {
    t.plan(3)

    var render = cacheElement((name) => html`<div>${name}</div>`)

    var el1 = render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    var el2 = render('mittens')
    var same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')

    var el3 = render('scruffles')
    t.equal(String(el3), '<div>scruffles</div>', 're-render success')
  })

  t.test('should accept a custom compare function', (t) => {
    t.plan(2)
    var create = (name) => html`<div>${name}</div>`
    var render = cacheElement(create, function (args1, args2) {
      return args1[0] === 'humans!'
    })

    var el1 = render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    var el2 = render('humans!')
    var same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')
  })
})

test('widget', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(1)
    t.throws(widget.bind(null, 123), /object/)
  })

  t.test('should render elements', (t) => {
    t.plan(4)
    var element = Element()

    var el1 = element('mittens')
    var expected = '<div>mittens</div>'
    t.equal(String('<div>mittens</div>'), expected, 'init render success')

    var el2 = element('snowball')
    var same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')
    t.ok(/snowball/.test(el1.toString()), 'content was updated')

    var el3 = element('scruffles')
    var same2 = el3.isSameNode(el1)
    t.equal(same2, true, 'proxy success')

    function Element () {
      return widget({
        onupdate: function (el, newName) {
          morph(html`<p>${newName}</p>`, el)
        },
        render: function (name) {
          return html`<p>${name}</p>`
        }
      })
    }
  })
})
