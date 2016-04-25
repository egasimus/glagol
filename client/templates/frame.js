(function (frame, index) {

  return h('section.Frame',
    { dataset: { type: frame.type, address: frame.address } },
    [ h('.FrameHeader',
      [ h('.FrameTitle',
        [ frame.type
        , ' '
        , h('input.FrameAddress',
          { onchange: changeAddress
          , value: frame.address }) ])
      , h('.FrameStatus', frame.status)
      , h('div', { style: { flexGrow: 1 } })
      , h('.FrameClose', { onclick: remove }, '×')])
    , h('.FrameBody', _.frames[frame.type](frame, index)) ]);

  function changeAddress (event) {
    event.preventDefault();
    App.model.frames.get(index).address.set(event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    $.commands.remove(index);
  }

});

