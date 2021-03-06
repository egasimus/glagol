module.exports = function () {

  [ 'directory'
  , 'image'
  , 'textEditor'
  , 'hexEditor'
  , 'file' ].forEach(registerFrameType)

}

function registerFrameType (type) {
  App.Workspace.registerFrameType(type, function () {
    return _.views[type].apply(null, arguments);
  })
}
