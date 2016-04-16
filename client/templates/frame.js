(function (frame, index) {

  return h('.Frame',
    { dataset: { type: frame.type, address: frame.address } },
    [ h('.FrameHeader',
      [ h('.FrameTitle', frame.type + '+' + frame.address)
      , h('.FrameStatus', frame.status)
      , h('div', { style: { flexGrow: 1 } })
      , h('.FrameClose', { onclick: remove }, '×')])
    , h('.FrameBody', _.frames[frame.type](frame, index)) ]);

  function remove (event) {
    event.preventDefault();
    $.commands.remove(index);
  }

});

