(function () {

  var server = _.lib.server.server("0.0.0.0", "1617",
    function () { return _.routes });

  server.http.on("listening", function () {
    console.log("listening on 0.0.0.0:1617");
  })

  server.sockets.on("connection", function (socket) {
    socket.on("message", function dispatch (msg) {
      if (msg === "glagol") {
        _.lib.bundler.updater.connected(_.routes, socket);
        socket.off("message", dispatch)
      }
      if (msg === "riko") {
        _.lib.api.connect(socket, _.api);
        socket.off("message", dispatch);
      }
    })
  })

})
