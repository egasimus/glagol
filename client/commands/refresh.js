(function (frame, index) {

  console.info("refresh", frame)
  FS('read', App.Model.Session.frames()[index].address);

})
