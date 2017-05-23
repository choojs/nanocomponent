// // adapted from https://github.com/timwis/choo-leaflet-demo/blob/master/src/map.js
var Nanocomponent = require('../')
var nanologger = require('nanologger')
var leaflet = require('leaflet')
var onIdle = require('on-idle')
var html = require('bel')

module.exports = Leaflet

function Leaflet () {
  if (!(this instanceof Leaflet)) return new Leaflet()
  Nanocomponent.call(this)

  this._log = nanologger('leaflet')
  this.state.map = null
  this.state.zoom = 12
}
Leaflet.prototype = Object.create(Nanocomponent.prototype)

Leaflet.prototype._render = function () {
  var self = this

  if (!this.state.map) {
    this._element = html`<div style="height: 500px"></div>`
    if (this._hasWindow) this._createMap()
  } else {
    onIdle(function () {
      self._updateMap()
    })
  }

  return this._element
}

Leaflet.prototype._update = function (props) {
  return props.coords[0] !== this.props.coords[0] ||
    props.coords[1] !== this.props.coords[1]
}

Leaflet.prototype._load = function () {
  this.state.map.invalidateSize()
  this._log.info('load')
}

Leaflet.prototype._unload = function () {
  this._log.info('unload')

  this.state.map.remove()
  this.state = {}
  this._element = null
}

Leaflet.prototype._createMap = function () {
  var element = this._element
  var coords = this.props.coords
  var zoom = this.state.zoom

  this._log.info('create-map', coords)

  var map = leaflet.map(element).setView(coords, zoom)
  leaflet.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map)
  this.state.map = map
}

Leaflet.prototype._updateMap = function () {
  var coords = this.props.coords
  this._log.info('update-map', coords)
  this.state.map.setView(coords)
}
