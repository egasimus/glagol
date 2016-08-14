module.exports = function (frame, index) {

  var cls     = '.Frame' + (frame.error ? '.FrameWithError' : '')
    , content = __.maps.types(frame.type, { frame: frame, index: index })
    , options = { dataset: { type: frame.type, address: frame.address }
                , style: {} }

  if (frame.width)  options.style.width  = frame.width + 'px';
  if (frame.height) options.style.height = frame.height + 'px';
  if (!frame.width || !frame.height) options.hook = $.lib.hook(function (el) {
    __.model.Frames.get(index).put('width', el.offsetWidth);
    __.model.Frames.get(index).put('height', el.offsetHeight); });

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
            (edge === 'Top' || edge === 'Left') ? -1 : 1
      if (previous) {
        offset = value - previous;
        previous = value;
      } else {
        previous = value;
        offset =
          value > 0 ?  1 :
          value < 0 ? -1 : 0;
      }
      console.log(axis, reverse * offset, frame)
      if (axis === 'Y') {
        var height = __.model.Frames.get(index).height()
        __.model.Frames.get(index).put('height', height + reverse * offset)
      } else if (axis === 'X') {
        var width = __.model.Frames.get(index).width()
        __.model.Frames.get(index).put('width',  width  + reverse * offset)
      }
    }
  }

}

function StoreSizeHook (index) {
  return $.lib.hook(function (element) {
    setTimeout(function () {
      __.model.Frames.get(index).put('width',  element.offsetWidth);
      __.model.Frames.get(index).put('height', element.offsetHeight);
      }, 0) }) }
