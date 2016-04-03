(function (model) {

  // debugger state
  var model = model ||
    { app:    null
    , path:   null
    , port:   null
    , socket: null };

  // parse path
  var appPath = require('path').resolve(process.argv[2]);
  $.log('loading', appPath);

  // load app
  model.app = require(appPath);
  $.log('loaded app from', appPath);

  // parse port
  var debugPort = process.argv[3] || 1616;
  $.log('listening on port', debugPort);
  model.port = debugPort;

  // start socket server
  var sockets = new (require("ws").Server)({ port: model.port })
  sockets.on('connection', connect);

  // launch app TODO async?
  model.app().main();

  // socket numbers
  var socketId = 0;

  function connect (socket) {
    // get socket id
    var id = socketId++;
    $.log('socket open', id);

    // set close handler
    socket.onclose = function () { console.log('socket close', id); }

    // expose app for remote access
    var connection = require('q-connection')(socket,
      function () { return model.app });
  }

  // return state
  return model;

})
