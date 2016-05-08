(function (frame, index) {

  console.info("refresh", frame)
  FS('read', App.Model.Workspace.frames()[index].address);

})
