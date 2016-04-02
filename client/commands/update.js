(function (newState) {
  newState = JSON.parse(newState);
  console.debug("update", newState);
  App.model.put("sessions", newState.sessions);
})
