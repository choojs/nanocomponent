// // adapted from https://github.com/timwis/choo-leaflet-demo/blob/master/src/map.js
var Nanocomponent = require('../')
var nanologger = require('nanologger')
var leaflet = require('leaflet')
var onIdle = require('on-idle')
var html = require('nanohtml')

module.exports = Leaflet

function Leaflet () {
  if (!(this instanceof Leaflet)) return new Leaflet()
  Nanocomponent.call(this)

  this._log = nanologger('leaflet')
  this.map = null // capture leaflet
  this.coords = [0, 0] // null island
}

Leaflet.prototype = Object.create(Nanocomponent.prototype)

Leaflet.prototype.createElement = function (coords) {
  this.coords = coords
  return html`
    <div style="height: 500px">
      <div id="map"></div>
    </div>
  `
}

Leaflet.prototype.update = function (coords) {
  if (!this.map) return this._log.warn('missing map', 'failed to update')
  if (coords[0] !== this.coords[0] || coords[1] !== this.coords[1]) {
    var self = this
    onIdle(function () {
      self.coords = coords
      self._log.info('update-map', coords)
      self.map.setView(coords, 12)
    })
  }
  return false
}

Leaflet.prototype.beforerender = function (el) {
  var coords = this.coords
  this._log.info('create-map', coords)

  var map = leaflet.map(el).setView(coords, 12)
  leaflet.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map)
  this.map = map
}

Leaflet.prototype.load = function () {
  this._log.info('load')
  this.map.invalidateSize()
}

Leaflet.prototype.unload = function () {
  this._log.info('unload')

  this.map.remove()
  this.map = null
  this.coords = [0, 0]
}
