var component = require('./')
var html = require('bel')

var el = component({
  onenter: function () {
    console.log('enter')
  },
  onexit: function () {
    console.log('exit')
  },
  onload: function () {
    console.log('load')
  },
  onunload: function () {
    console.log('unload')
  },
  onupdate: function () {
    console.log('update')
  },
  placeholder: function () {
    console.log('placeholder')
    return html`
      <div>oi</div>
    `
  },
  render: function () {
    console.log('render')
    return html`
      <div>oi</div>
    `
  }
})

var wrap = html`
  <main>
    ${el('foo', 'bar')}
  </main>
`

document.body.appendChild(wrap)
setTimeout(function () {
  document.body.removeChild(wrap)
}, 2000)
