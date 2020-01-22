module.exports = function knob (label, value) {

  return h('.Knob_WithLabel',
    { dragHook: __.hook() },
    [ h('.Knob_Label',
      [ h('div', label || '')
      , h('div', String(value || '0')) ])
    , h('.Knob', { onclick: onclick }) ])

}
