(function (newState) {

  console.debug("update", newState);

  App.model.put("frames",      require('riko-mvc/model')(newState.frames));
  App.model.put("directories", newState.directories);
  App.model.put("files",       newState.files);

})
