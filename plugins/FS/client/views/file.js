module.exports = function render (frame, index) {
  var file = App.Model.FS.Files()[frame.address]
  if (!file) {
    App.API('FS/GetInfo', frame.address)
    return 'loading...'
  }
  var type = __.type(file.contentType, App.Model.Workspace.Frames.get(index));
  if (!type) {
    return _.unknown(frame, index);
  } else {
    App.API('Workspace/Change', frame.id, 'type', type);
    return _[type](frame, index);
  }
}
