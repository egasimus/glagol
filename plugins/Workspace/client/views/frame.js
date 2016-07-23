module.exports = function (frame, index) {

  var cls     = '.Frame' + (frame.error ? '.FrameWithError' : '')
    , options = { dataset: { type: frame.type, address: frame.address } }
    , body    = __.maps.types(frame.type, { frame: frame, index: index });

  return h('section' + cls, options, body);

}
