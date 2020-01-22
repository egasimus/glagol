module.exports = function (frame, index) {
  var file = App.Model.FS.Files()[frame.address];
  return [
    $.plugins.Workspace.views.frameHeader(frame, index),
    h('.File_Unknown',
      [ $.lib.icon('info-circle')
      , h('em.File_Unknown_Title', file.path)
      , h('br')
      , 'has an unfamiliar type, '
      , h('em', file.contentType)
      , h('br')
      , 'Open as: '
      , h('button', 'Plaintext')
      , ' '
      , h('button', 'Binary')
      , ' '
      , h('button', 'Other type...') ])
  ]
}
