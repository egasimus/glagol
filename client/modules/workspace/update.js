(function (newState) {

  console.debug("update", newState);

  Object.keys(newState.frames).forEach(function (id) {
    var frame = newState.frames[id]
    if (frame.type === 'directory' || frame.type === 'file') {
      App.FS('read', frame.address);
    }
  })

  App.Model.Workspace.put("frames", $.lib.model(newState.frames));

})
