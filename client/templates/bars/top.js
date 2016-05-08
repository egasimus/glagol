(function (state) {

  return h('.TopBar', state.Workspace.frames.map(function (frame, i) {
    var icon =
      frame.type === 'directory' ? __.icon('folder-open-o') :
      frame.type === 'file'      ? __.icon('music') : '???'
    return h('.TopBar_Button',
      [ icon, ' '
      , require('path').basename(frame.address) ]);
  }))

})
