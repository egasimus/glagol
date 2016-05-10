(function (state) {

  return h('.TopBar', state.Workspace.frames.map(function (frame, i) {
    var icon =
      frame.type === 'directory' ? $.lib.icon('folder-open-o') :
      frame.type === 'file'      ? $.lib.icon('music') : '???'
    return h('.TopBar_Button',
      [ icon, ' '
      , require('path').basename(frame.address) ]);
  }))

})
