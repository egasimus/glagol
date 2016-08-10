module.exports = function (frame, index) {
  return [
    $.plugins.Workspace.views.frameHeader(frame, index),
    h('div.ImageContainer',
      h('img', { src: '/api/FS/ReadFile?' + JSON.stringify([file.path]) }))
  ]
}
