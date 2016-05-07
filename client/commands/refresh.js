(function (frame, index) {

  console.info("refresh", frame)
  FS('read', App.model.frames()[index].address);

})
