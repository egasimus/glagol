(function (newState) {

  console.debug("update", newState);

  newState.frames.forEach(function (frame, i) {
    if (frame.type === 'directory') {
      FS('read', frame.address);
    }
  })

  App.model.put("frames", require('riko-mvc/model')(newState.frames));

})
