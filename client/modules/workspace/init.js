(function init (App) {

  var socket = new WebSocket('ws://localhost:1617')
    , API    = require('riko-api2')(socket);

  socket.onopen = function () {
    socket.onopen = null;
    socket.send('riko');
    API('refresh');
  }

  socket.onclose = function () {
    window.location.reload()
  }

  socket.onmessage = function (message) {
    console.debug("Session update", message.data)
    $.modules.workspace.update(JSON.parse(message.data))
  }

  App.Workspace = API;

})
