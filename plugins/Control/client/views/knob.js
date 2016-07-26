module.exports = function knob (label, value) {
  return h('.Knob_Label',
    [ h('.Knob_Label_Text',
      [ h('div', label || '')
      , h('div', String(value || '0')) ])
    , h('.Knob') ]) }
