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
  this.state = {}
  this.state.zoom = 12
  this.state.map = null
}
Leaflet.prototype = Object.create(Nanocomponent.prototype)

Leaflet.prototype._render = function (props) {
  this.props = props
  return html`<div style="height: 500px">
    <div id="map"></div>
  </div>`
}

Leaflet.prototype._willRender = function (el) {
  this._createMap(el)
}

Leaflet.prototype._update = function (props) {
  return false
}

Leaflet.prototype._load = function () {
  this._log.info('load')
  this.state.map.invalidateSize()
}

Leaflet.prototype._unload = function () {
  this._log.info('unload')

  this.state.map.remove()
  this.state = {}
}

Leaflet.prototype._createMap = function (el) {
  var coords = this.props.coords
  var zoom = this.state.zoom
  console.log(el)

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

Leaflet.prototype._didUpdate = function () {
  this.state.map.invalidateSize()
}
