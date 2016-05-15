(function (newState) {

  console.debug("update", newState);

  newState.frames.forEach(function (frame, i) {
    if (frame.type === 'directory' || frame.type === 'file') {
      App.FS('read', frame.address);
    }
  })

  App.Model.Workspace.put("frames", $.lib.model(newState.frames));

})
