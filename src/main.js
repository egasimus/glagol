(function (state) {

  // debugger state
  var state = state || {};

  // enable live editing
  Glagol.events.once('changed', reload);

  // parse path
  if (!state.path) {
    state.path = require('path').resolve(process.argv[2]);
  }

  // load app
  if (!state.app) {
    state.app = require(state.path);
    $.log('loaded app from', state.path);
  }

  // parse port
  if (!state.port) {
    state.port = process.argv[3] || 1616;
  }

  // start socket server
  if (!state.sockets) {
    state.sockets = new (require("ws").Server)({ port: state.port })
    $.log('listening on port', state.port);
  }
  state.sockets.on('connection', connect);

  // launch app
  // TODO async?
  if (!state.started) {
    state.app().main();
    state.started = true;
    $.log('started app', state.app);
  }

  function connect (socket) {
    // get socket id
    var id = state.socketId++;
    $.log('socket', id, 'opened');

    // set close handler
    socket.onclose = function () { console.log('socket', id, 'closed'); }

    // expose app for remote access
    var connection = require('q-connection')(socket, function () {
      return _.serialize(state.app) });
  }

  function reload (self) {
    if (state.sockets) {
      $.log('restarting server...')
      state.sockets.removeListener("connection", connect);
    }
    self()(state);
  }

})
