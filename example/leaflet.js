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
  this._element = null
  this._coords = null
  this._map = null
  this._zoom = 12
}
Leaflet.prototype = Object.create(Nanocomponent.prototype)

Leaflet.prototype._render = function (coords) {
  var self = this
  this._coords = coords

  if (!this._map) {
    this._element = html`<div style="height: 500px"></div>`
    this._createMap()
  } else {
    onIdle(function () {
      self._updateMap()
    })
  }

  return this._element
}

Leaflet.prototype._update = function (coords) {
  return coords[0] !== this._coords[0] || coords[1] !== this._coords[1]
}

Leaflet.prototype._load = function () {
  this._map.invalidateSize()
  this._log.info('load')
}

Leaflet.prototype._unload = function () {
  this._log.info('unload')

  this._map.remove()
  this._coords = null
  this._map = null
  this._element = null
}

Leaflet.prototype._createMap = function () {
  var element = this._element
  var coords = this._coords
  var zoom = this._zoom

  this._log.info('create-map', coords)

  var map = leaflet.map(element).setView(coords, zoom)
  leaflet.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map)
  this._map = map
}

Leaflet.prototype._updateMap = function () {
  var coords = this._coords
  this._log.info('update-map', coords)
  this._map.setView(coords)
}
