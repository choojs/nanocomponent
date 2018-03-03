var nanobus = require('nanobus')
var Nanocomponent = require('../../')
var compare = require('../../compare')
var html = require('bel')

class LifeCycleComp extends Nanocomponent {
  constructor () {
    super()
    this.bus = nanobus()
    this.testState = {
      'create-element': 0,
      update: 0,
      beforerender: 0,
      afterupdate: 0,
      load: 0,
      unload: 0
    }
  }
  createElement (text) {
    this.arguments = arguments
    this.testState['create-element']++
    return html`<div>${text}</div>`
  }

  update (text) {
    var shouldUpdate = compare(this.arguments, arguments)
    this.testState.update++
    return shouldUpdate
  }

  beforerender () {
    this.testState.beforerender++
  }

  afterupdate () {
    this.testState.afterupdate++
  }

  load (el) {
    this.testState.load++
    this.bus.emit('load', el)
  }

  unload (el) {
    this.testState.unload++
    this.bus.emit('unload', el)
  }
}

module.exports = LifeCycleComp
