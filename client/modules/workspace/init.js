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
    var data = JSON.parse(message.data);
    console.debug("Workspace update", data);
    $.modules.workspace.update(data);
  }

  window.addEventListener('keyup', function (event) { _.onKey(event) })

  App.Workspace = API;

})
