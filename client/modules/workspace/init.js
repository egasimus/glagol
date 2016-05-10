(function initSessionAPI () {
  var socket     = new WebSocket('ws://localhost:1617')
    , sessionAPI = require('riko-api2')(socket);
  socket.onopen = function () {
    socket.onopen = null;
    socket.send('riko');
    sessionAPI('refresh');
  }
  socket.onclose = function () {
    window.location.reload()
  }
  socket.onmessage = function (message) {
    //console.debug("Session update", message.data)
    $.modules.workspace.update(JSON.parse(message.data))
  }
  return sessionAPI;
})
