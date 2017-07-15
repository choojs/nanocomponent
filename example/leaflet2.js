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
  this.map = null // capture leaflet
  this.zoom = 12
  this.coords = [0,0] // null island
}

Leaflet.prototype = Object.create(Nanocomponent.prototype)


Leaflet.prototype._render = function (zoom, coords) {
  this.zoom = 12
  this.coords = coords
  return html`
    <div style="height: 500px">
      <div id="map"></div>
    </div>
  `


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
