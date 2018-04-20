var Nanocomponent = require('../../')
var html = require('nanohtml')

class BlogSection extends Nanocomponent {
  constructor (name = 'BlogSection') {
    super(name)
    this.entries = null
  }

  createElement (entries) {
    this.entries = entries
    return html`
      <section>
        ${entries && entries.length > 0 ? entries.map(e => html`<p>${e}</p>`) : 'No entries'}
      </section>
    `
  }

  update (entries) {
    if (entries !== this.entries || this.entries.some((e, i) => e !== entries[i])) return true
    return false
  }
}

module.exports = BlogSection
