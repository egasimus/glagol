(function (newState) {
  newState = JSON.parse(newState);
  App.model.put("sessions", newState.sessions);
})
