var component = require('./')
var html = require('bel')

var el = component({
  onenter: function () {
    console.info(Date.now(), 'enter')
  },
  onexit: function () {
    console.info(Date.now(), 'exit')
  },
  onload: function () {
    console.info(Date.now(), 'load')
  },
  onunload: function (el) {
    console.info(Date.now(), 'unload')
  },
  onupdate: function () {
    console.info(Date.now(), 'update')
  },
  onresize: function () {
    console.info(Date.now(), 'resize')
  },
  placeholder: function () {
    console.info(Date.now(), 'placeholder')
    return html`
      <button>loading</button>
    `
  },
  render: function () {
    console.info(Date.now(), 'render')
    return html`
      <button onclick=${onclick}>remove from DOM</button>
    `
  }
})

var wrap = html`
  <main>
    ${el('foo', 'bar')}
  </main>
`

document.body.appendChild(wrap)

function onclick () {
  console.log('clicked!')
  document.body.removeChild(wrap)
}
