(function () {

  _.model.app(require('path').resolve(process.argv[2]));
  _.model.port(process.argv[3] || 1616);

  var sockets = new (require("ws").Server)({ port: _.model.port() })
  sockets.on('connection', _.model.socket)

})
