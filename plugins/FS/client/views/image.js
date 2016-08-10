module.exports = function (frame, index) {
  var file = App.Model.FS.Files()[frame.address];
  return [
    $.plugins.Workspace.views.frameHeader(frame, index),
    h('div.ImageContainer',
      h('img', { src: '/api/FS/ReadFile?' + JSON.stringify([file.path]) }))
  ]
}
