module.exports = _.loading(function (frame, index, file) {
  return [
    $.plugins.Workspace.views.frameHeader(frame, index),
    h('div.ImageContainer',
      h('img', { src: '/api/FS/ReadFile?' + JSON.stringify([file.path]) }))
  ]
})
