(function (state) {

  // process state
  var state = state || {};

  // enable live editing
  Glagol.events.once('changed', reload);

  // parse port
  if (!state.port) state.port = process.argv[2] || 1615;

  // (re-)start http and socket server
  // TODO use promises?
  // TODO don't break connections?
  initHttp();

  function initHttp () {
    if (state.http) state.http.close(init); else init();
    function init () {
      state.http = new (require("http").Server)();
      state.http.on("request", respond);
      state.http.listen(state.port);
      $.log('http listening on port', state.port);
      initWs();
    }
  }

  function initWs () {
    if (state.sockets) state.sockets.close(init); else init();
    function init () {
      state.sockets = new (require("ws").Server)({ server: state.http })
      state.sockets.on('connection', connect);
      state.lastSocket = state.lastSocket || -1;
    }
  }

  function respond (req, res) {
    $.log("responding to http request", req.url);
    var query = require('url').parse(req.url, true).query;
    $.log("query", query.path)
    require('send-data')(req, res, { body: require('fs').readFileSync(query.path) })
  }

  function connect (socket) {
    // give the socket an id, for reference
    var id  = ++state.lastSocket
      , url = socket.upgradeReq.url;
    $.log('socket', id, 'opened');

    // set socket's event handlers
    socket.onclose   = function () {
      $.log('socket', id, 'closed')
    }
    socket.onmessage = function () {
      $.api({ socket: socket }).apply(this, arguments)
    }
  }

  function reload (self) {
    //if (state.sockets) {
      //$.log('restarting server...')
      //state.sockets.removeListener("connection", connect);
    //}
    self()(state);
  }

})
