const cacheElement = require('./')
const test = require('tape')
const html = require('bel')

test('cache', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(2)
    t.throws(cacheElement.bind(null, 123), /function/)
    t.throws(cacheElement.bind(null, () => {}, 123), /function/)
  })

  t.test('should render elements', (t) => {
    t.plan(3)

    const render = cacheElement((name) => html`<div>${name}</div>`)

    const el1 = render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    const el2 = render('mittens', 'mittens')
    const same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')

    const el3 = render('scruffles', 'mittens')
    t.equal(String(el3), '<div>scruffles</div>', 're-render success')
  })

  t.test('should accept a custom compare function', (t) => {
    t.plan(2)
    const create = (name) => html`<div>${name}</div>`
    const compare = (el) => (el === 'humans!')
    const render = cacheElement(create, compare)

    const el1 = render('mittens')
    t.equal(String(el1), '<div>mittens</div>', 'init render success')

    const el2 = render('humans!')
    const same1 = el2.isSameNode(el1)
    t.equal(same1, true, 'proxy success')
  })
})

test('widget')
