(function () {

  var server = _.lib.server.server("0.0.0.0", "1617",
    function () { return _.routes });

  server.http.on("listening", function () {
    console.log("listening on 0.0.0.0:1617");
  })

  server.sockets.on("connection", function (socket) {
    // connected routes socket
    _.lib.bundler.updater.connected(_.routes, socket);
  })

})
