(function init () {

  var socket  = new WebSocket('ws://localhost:1615')

  socket.onmessage = function (message) {
    console.debug("FS update", message.data)
    $.modules.fs.update(JSON.parse(message.data));
  }

  App.FS = require('riko-api2')(socket);

})
