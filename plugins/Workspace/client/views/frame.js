module.exports = function (frame, index) {

  var cls     = '.Frame' + (frame.error ? '.FrameWithError' : '')
    , options = { dataset: { type: frame.type, address: frame.address } }
    , content = __.maps.types(frame.type, { frame: frame, index: index });

  return h('section' + cls, options,
    [ content
    , ['Top', 'Bottom', 'Left', 'Right'].map(function (edge) {
        return h(
          '.Frame_Dragger_' + edge,
          { draggable: true
          , ondrag:    resize(edge) } ); }) ]);

  function resize (edge) {
    var previous = null;
    return function (event) {
      var offset =
            0
        , axis =
            (edge === 'Left' || edge === 'Right') ? 'X' :
            (edge === 'Top' || edge === 'Bottom') ? 'Y' : undefined
        , value =
            event['offset' + axis]
        , reverse =
            edge === 'Top' || edge === 'Left'
      if (previous) {
        offset = value - previous;
        previous = value;
      } else {
        previous = value;
        offset =
          value > 0 ?  1 :
          value < 0 ? -1 : 0;
      }
      console.log(edge, offset);
      console.log(__.model.Frames.get(index)())
    }
  }

}
