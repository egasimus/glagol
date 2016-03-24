(function () {

  var server = _.lib.server.server("0.0.0.0", "1617",
    function () { return _.routes });

  server.http.on("listening", function () {
    console.log("listening on 0.0.0.0:1617");
  })

  server.sockets.on("connection", function (socket) {
    socket.onmessage = function dispatch (msg) {
      if (msg.data === "glagol") {
        socket.onmessage = null;
        _.lib.bundler.updater.connected(_.routes, socket);
      }
      if (msg.data === "riko") {
        socket.onmessage = null;
        _.lib.api.connect(socket, function () { return _.api });
      }
    }
  })

})
