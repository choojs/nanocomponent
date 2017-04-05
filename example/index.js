// adapted from https://github.com/timwis/choo-leaflet-demo/blob/master/src/index.js
var microbounce = require('microbounce')
var html = require('choo/html')
var css = require('sheetify')
var log = require('choo-log')
var logger = require('nanologger')
var choo = require('choo')

var Leaflet = require('./leaflet.js')

css('tachyons')
css('./leaflet.css')

var leaflet = Leaflet()
var app = choo()

app.use(log())
app.use(function (state, emitter) {
  var log = logger('sse')
  var source = new window.EventSource('sse')

  source.addEventListener('open', function () {
    log.info('connected')
  })

  source.addEventListener('message', function (event) {
    try {
      var ev = JSON.parse(event.data)
    } catch (e) {
      return log.error('error parsing event', e)
    }
    if (ev.type === 'css') loadCss()
    else if (ev.type === 'js') loadJs()
    else log.warn('unknown', event)
  }, false)

  source.addEventListener('error', function (event) {
    if (event.target.readyState === window.EventSource.CLOSED) {
      source.close()
      log.info('closed')
    } else if (event.target.readyState === window.EventSource.CONNECTING) {
      log.warn('reconnecting')
    } else {
      log.error('connection closed: unknown error')
    }
  }, false)

  function loadJs () {
    log.info('javascript', 'reloading')
    window.location.reload()
  }

  function loadCss (content) {
    var node = document.createElement('style')
    node.setAttribute('type', 'text/css')
    node.textContent = content

    log.info('stylesheet', node)

    var linkNode = document.querySelector('link')
    if (linkNode) linkNode.parentNode.removeChild(linkNode)

    var prevNode = document.querySelector('style')
    if (prevNode) prevNode.parentNode.replaceChild(node, prevNode)
    else document.head.appendChild(node)
  }
})

app.use(store)
app.route('/', mainView)
app.mount('body')

var debounce = microbounce(128)
function mainView (state, emit) {
  return html`
    <body class="sans-serif">
      <header>
        <h1>${state.title}</h1>
      </header>
      <nav>
        <input value=${state.title} oninput=${updateTitle}/>
        <button onclick=${toPhiladelphia}>Philadelphia</button>
        <button onclick=${toSeattle}>Seattle</button>
      </nav>
      <main>
        ${leaflet.render(state.coords)}
      </main>
    </body>
  `

  function updateTitle (evt) {
    var value = evt.target.value
    debounce(function () {
      emit('update-title', value)
    })
  }

  function toPhiladelphia () {
    emit('set-coords', [39.9526, -75.1652])
  }

  function toSeattle () {
    emit('set-coords', [47.6062, -122.3321])
  }
}

function store (state, emitter) {
  state.coords = [39.9526, -75.1652]
  state.title = 'Hello, World'

  emitter.on('DOMContentLoaded', function () {
    emitter.on('set-coords', setCoords)
    emitter.on('update-title', updateTitle)
  })

  function setCoords (newCoords) {
    state.coords = newCoords
    emitter.emit('render')
  }

  function updateTitle (newTitle) {
    state.title = newTitle
    emitter.emit('render')
  }
}
