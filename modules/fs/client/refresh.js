(function (frame, index) {

  console.info("refresh", frame)
  App.FS('read', frame.address);

})
