module.exports = function frameError (frame, index) {
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

  function clearError (event) {
    event.preventDefault();
    App.model.frames.get(index).put('error', null)
  }
}
