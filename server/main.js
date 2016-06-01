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
    _.onConnection(socket);
  }

})
