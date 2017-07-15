// adapted from https://github.com/timwis/choo-leaflet-demo/blob/master/src/index.js
var microbounce = require('microbounce')
var html = require('choo/html')
var css = require('sheetify')
var log = require('choo-log')
var choo = require('choo')
var Leaflet = require('./leaflet.js')

css('leaflet')

var leaflet = new Leaflet()
var app = choo()

app.use(log())
app.use(store)
app.route('/', mainView)
app.mount('body')

var debounce = microbounce(128)
function mainView (state, emit) {
  return html`
    <body>
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
