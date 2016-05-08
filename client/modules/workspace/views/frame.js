(function (frame, index) {

  if (!frame) return;

  return h('section.Frame' + (frame.error ? '.FrameWithError' : ''),
    { dataset: { type: frame.type, address: frame.address } },
    [ h('header.FrameHeader',
      [ h('.FrameTitle',
        [ frameType()
        , ' '
        , h('input.FrameAddress',
          { onchange: changeAddress
          , value: frame.address
          , size: 40 }) ])
      , h('.FrameClose', { onclick: remove }, '×')])
    , frameError()
    , h('.FrameBody', __.getViewForType(frame.type, { frame: frame, index: index}))
    ]);

  function changeAddress (event) {
    event.preventDefault();
    API('change', index, 'address', event.target.value);
  }

  function remove (event) {
    event.preventDefault();
    __.remove(index);
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
        , [ h('.FrameErrorMessage', frame.error.message)
          , frame.error.stack ? h('.FrameErrorStack',   frame.error.stack) : ''
          ] ])
      , h('.FrameErrorClose', { onclick: clearError }, '×') ])
  }

  function clearError (event) {
    event.preventDefault();
    App.model.frames.get(index).put('error', null)
  }

  function frameType () {
    return frame.type === 'file'
      ? (App.Model.FS.files()[frame.address] || {}).type || 'file'
      : frame.type
  }

});

