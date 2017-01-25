var component = require('./')
var css = require('sheetify')
var html = require('bel')

css('tachyons')

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
      <section>
        <button class="ma3 f3">
          loading
        </button>
      </section>
    `
  },
  render: function () {
    console.info(Date.now(), 'render')
    return html`
      <section>
        <button onclick=${onclick} class="ma3 f3">
          remove from DOM
        </button>
      </section>
    `
  }
})

var _el = el('foo', 'bar')
var wrap = html`
  <main>
    <h1 class="f1 pa3 underline">
      the component testing playground
    </h1>
    ${_el}
  </main>
`

document.body.appendChild(wrap)

function onclick () {
  console.log('clicked!')
  window.requestAnimationFrame(function () {
    wrap.removeChild(_el)
  })
}
