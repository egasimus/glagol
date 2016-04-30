(function (frame, index) {

  return h('section.Frame' + (frame.error ? '.FrameWithError' : ''),
    { dataset: { type: frame.type, address: frame.address } },
    [ h('header.FrameHeader',
      [ h('.FrameTitle',
        [ frame.type
        , ' '
        , h('input.FrameAddress',
          { onchange: changeAddress
          , value: frame.address }) ])
      , h('.FrameStatus', frame.status)
      , h('div', { style: { flexGrow: 1 } })
      , h('.FrameClose', { onclick: remove }, '×')])
    , frameError()
    , h('.FrameBody', _.frames[frame.type](frame, index)) ]);

  function changeAddress (event) {
    event.preventDefault();
    App.model.frames.get(index).address.set(event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    $.commands.remove(index);
  }

  function frameError () {
    if (!frame.error) return;
    return h('.FrameError',
      [ h('.FrameErrorBody',
        [ frame.error['@']
          ? h('.FrameErrorRemote',
              [ "Remote error "
              , h('strong', frame.error['@']) ])
          : ''
        , h('.FrameErrorMessage', frame.error.message) ])
      , h('.FrameErrorClose', { onclick: clearError }, '×') ])
  }

  function clearError (event) {
    event.preventDefault();
    App.model.frames.get(index).put('error', null)
  }

});

