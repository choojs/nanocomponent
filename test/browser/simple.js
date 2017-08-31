var Nanocomponent = require('../../')
var html = require('bel')

module.exports = SimpleComponent

function SimpleComponent (name) {
  if (!(this instanceof SimpleComponent)) return new SimpleComponent(name)
  this.name = name
  this.color = null
  Nanocomponent.call(this)
}

SimpleComponent.prototype = Object.create(Nanocomponent.prototype)

SimpleComponent.prototype.createElement = function (color) {
  this.color = color || 'blue'
  return html`
      <div>
        <p class="name">${this.name}</p>
        <p class="color">${this.color}</p>
      </div>
    `
}

SimpleComponent.prototype.update = function (color) {
  if (this.color !== color) return true
  if (this.element.querySelector('.name').value !== this.name) return true
  return false
}
