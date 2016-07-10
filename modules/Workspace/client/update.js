(function (App, newState) {

  console.debug("Update workspace", newState);

  var Workspace = App.Model.Workspace
    , newFrames = [];

  newState.Users[Workspace.userId()].Frames.forEach(function (id) {
    var frame = newState.Frames[id];
    if (!frame) return;
    newFrames.push(frame);
    if (['directory', 'file'].indexOf(frame.type) > -1) {
      App.API('FS/GetInfo', frame.address);
    }
  })

  App.Model.Workspace.put("Frames", $.lib.model(newFrames));

})
