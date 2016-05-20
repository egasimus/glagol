(function (newState) {

  console.debug("update", newState);

  Object.keys(newState.windows).forEach(function (id) {
    var w = newState.windows[id]
    if (w.type === 'directory' || w.type === 'file') {
      App.FS('read', w.address);
    }
  })

  App.Model.Workspace.put("windows", $.lib.model(newState.windows));

})
