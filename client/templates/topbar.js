(function (state) {

  return h('.TopBar', state.Session.frames.map(function (frame, i) {
    var icon =
      frame.type === 'directory' ? _.icon('folder-open-o') :
      frame.type === 'file'      ? _.icon('music') : '???'
    return h('.TopBar_Button',
      [ icon, ' '
      , require('path').basename(frame.address) ]);
  }))

})
