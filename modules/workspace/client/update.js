(function (newState) {

  console.debug("Update workspace", newState);

  var Workspace = App.Model.Workspace
    , newFrames = [];

  newState.users[Workspace.userId()].frames.forEach(function (id) {
    var frame = newState.frames[id];
    if (!frame) return;
    newFrames.push(frame);
    if (['directory', 'file'].indexOf(frame.type) > -1) {
      App.FS('read', frame.address);
    }
  })

  Object.keys(newState.frames).forEach(function (id) {
    var frame = newState.frames[id]
    if (frame.type === 'directory' || frame.type === 'file') {
      App.FS('read', frame.address);
    }
  })

  App.Model.Workspace.put("Frames", $.lib.model(newFrames));

})
