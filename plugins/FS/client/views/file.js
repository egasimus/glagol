module.exports = _.loading(function (frame, index, file) {
  var type = __.type(file.contentType, App.Model.Workspace.Frames.get(index));
  if (!type) {
    return _.unknown(frame, index);
  } else {
    App.API('Workspace/Change', frame.id, 'type', type);
    return _[type](frame, index);
  }
})
