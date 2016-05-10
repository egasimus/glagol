(function (frame, index) {

  console.info("refresh", frame)
  App.FS('read', App.Model.Workspace.frames()[index].address);

})
