(function (server) {

  Glagol.events.once('changed', function (node) {
    if (server) {
      server.http.removeListener("listening", listening);
      server.sockets.removeListener("connection", connection);
    }
    node()(server);
  })

  server = server || _.lib.server.server("0.0.0.0", "1617",
    function () { return _.routes });
  server.http.on("listening", listening);
  server.sockets.on("connection", connection);
  return server;

  function listening () {
    $.log("listening on 0.0.0.0:1617");
  }

  function connection (socket) {
    socket.onmessage = function dispatch (msg) {
      if (msg.data === "glagol") {
        socket.onmessage = null;
        _.lib.bundler.updater.connected(_.routes, socket);
      }
      if (msg.data === "riko") {
        var state = { id: _.lib.shortid() }
        $.log("opened client connection", state.id);
        _.model.users.put(state.id, state);
        socket.onmessage = require('riko-api2')($.api)(state);
        socket.onclose = function () {
          $.log('closed client connection', state.id)
        }
      }
    }
  }

})
