module.exports = function frameError (frame, index) {
  if (!frame.error) return;
  return h('.Frame_Error',
    [ h('.Frame_Error_Body',
      [ frame.error['@']
        ? h('.Frame_Error_Remote',
            [ "Remote error "
            , h('strong', frame.error['@']) ])
        : ''
      , [ h('.Frame_Error_Message', frame.error.message)
        , frame.error.stack ? h('.Frame_Error_Stack',   frame.error.stack) : ''
        ] ])
    , h('.Frame_Error_Close', { onclick: clearError }, '×') ])

  function clearError (event) {
    event.preventDefault();
    App.model.frames.get(index).put('error', null)
  }
}
