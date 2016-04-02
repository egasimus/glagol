(function () {

  var slavePath = require('path').resolve(process.argv[2])
    , port      = process.argv[3] || '1616'
    , sockets   = new (require("ws").Server)({ port: port })
    , socketId  = 0;

  console.log("debugging", slavePath, "at", port);

  var slaveApp = require(slavePath);

  sockets.on('connection', function (socket) {
    var id = socketId++;
    console.log('socket', id, 'connected');
    socket.onclose = function () {
      console.log('socket', id, 'closed');
    }
    socket.onmessage = function (msg) {
      socket.onmessage = null;
      _.server.connect(socket, function () { return slaveApp });
    }
  })

})
