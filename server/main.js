(function (state) {

  // process state
  var state = state || {};

  // enable live editing
  Glagol.events.once('changed', reload);

  // parse port
  if (!state.port) state.port = process.argv[2] || 1615;

  // start socket server
  if (!state.sockets) {
    state.sockets = new (require("ws").Server)({ port: state.port })
    $.log('listening on port', state.port);
  }
  state.sockets.on('connection', connect);
  state.lastSocket = state.lastSocket || -1;

  function connect (socket) {
    // give the socket an id, for reference
    var id  = ++state.lastSocket
      , url = socket.upgradeReq.url;
    $.log('socket', id, 'opened');

    // set socket handlers
    socket.onclose   = function () {
      $.log('socket', id, 'closed')
    }
    socket.onmessage = function () {
      _.api({ socket: socket }).apply(this, arguments)
    }
  }

  function reload (self) {
    if (state.sockets) {
      $.log('restarting server...')
      state.sockets.removeListener("connection", connect);
    }
    self()(state);
  }

})
