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
    console.log("listening on 0.0.0.0:1617");
  }

  function connection (socket) {
    socket.onmessage = function dispatch (msg) {
      if (msg.data === "glagol") {
        socket.onmessage = null;
        _.lib.bundler.updater.connected(_.routes, socket);
      }
      if (msg.data === "riko") {
        socket.onmessage = null;
        var id  = _.lib.shortid()
          , api = _.lib.api.connect(socket, function () { return _.api });
        console.log("opened user connection", id);
        _.model.users.put(id, api);
        socket.onclose = function () {
          console.log("closing user connection", id);
          _.model.users.delete(id);
        }
      }
    }
  }

})
