module.exports = function (frame, index) {

  var cls     = '.Frame' + (frame.error ? '.FrameWithError' : '')
    , options = { dataset: { type: frame.type, address: frame.address } }
    , content = __.maps.types(frame.type, { frame: frame, index: index });

  return h('section' + cls, options,
    [ content
    , ['Top', 'Bottom', 'Left', 'Right'].map(function (direction) {
        return h(
          '.Frame_Dragger_' + direction,
          { draggable: true
          , ondrag:    resize(direction) } ); }) ]);

  function resize (direction) {
    return function (event) {
      console.log(direction, event);
    }
  }

}
