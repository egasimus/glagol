(function (newState) {
  newState = JSON.parse(newState);
  console.debug("update", newState);
  App.model.put("frames", require('riko-mvc/model')(newState.frames));
})
