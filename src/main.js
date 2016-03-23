(function () {

  var slavePath = require('path').resolve(process.argv[2])
    , port      = process.argv[3] || '1616'
    , sockets   = new (require("ws").Server)({ port: port });

  sockets.on('connection', function (socket) {
    socket.onmessage = function (msg) {
      socket.onmessage = null;
      _.server.connect(socket, _.api);
    }
  })

})
