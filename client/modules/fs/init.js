(function initFileAPI () {
  var socket  = new WebSocket('ws://localhost:1615')
    , fileAPI = require('riko-api2')(socket)
  socket.onmessage = function (message) {
    //console.debug("FS update", message.data)
    $.modules.fs.update(JSON.parse(message.data));
  }
  return fileAPI;
})
