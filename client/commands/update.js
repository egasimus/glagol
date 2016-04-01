(function (newState) {
  newState = JSON.parse(newState);
  console.log("update", newState);
  App.model.put("sessions", newState.sessions);
})
