(function init () {

  var socket  = new WebSocket('ws://localhost:1615')

  socket.onmessage = function (message) {
    var data = JSON.parse(message.data)
    console.debug("FS update", data)
    _.update(data);
  }

  App.FS = require('riko-api2')(socket);

})
