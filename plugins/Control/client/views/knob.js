var vdom = require('virtual-dom')

module.exports = function knob (label, value) {

  return require('vdom-thunk')(module.exports.widget, label, value);

}

module.exports.widget = function (label, value) {

  var widget =
    { type:
        'Widget'
    , init:
        function () {
          this.element = vdom.create(module.exports.render(label, value));
          return this.element; }
    , update:
        function (prev, el) {
          this.element = this.element || prev.element; }
    , destroy:
        function (el) {} }

  return widget;

}

module.exports.render = function (label, value) {

  return h('.Knob_Label',
    [ h('.Knob_Label_Text',
      [ h('div', label || '')
      , h('div', String(value || '0')) ])
    , h('.Knob', { onclick: onclick }) ])

}

function onclick () {
  console.log('click')
}
