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
  state.lastSocket = state.lastSocket || -1;

  // launch app
  // TODO async?
  if (!state.started) {
    state.app().main();
    state.started = true;
    $.log('started app', _.serialize(state.app));
  }

  function connect (socket) {
    // give the socket an id, for reference
    var id  = ++state.lastSocket
      , url = socket.upgradeReq.url;
    $.log('socket', id, 'opened at', url);

    // set socket handlers
    socket.onclose   = function () { console.log('socket', id, 'closed') }
    socket.onmessage = function () { _.api(state, socket).apply(this, arguments) }
  }

  function reload (self) {
    if (state.sockets) {
      $.log('restarting server...')
      state.sockets.removeListener("connection", connect);
    }
    self()(state);
  }

})
