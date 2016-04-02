(function () {

  var appPath = require('path').resolve(process.argv[2]);
  $.log('loading', appPath);
  _.model.app.set(require(appPath));
  $.log('loaded app from', appPath);

  var debugPort = process.argv[3] || 1616;
  $.log('listening on port', debugPort);
  _.model.port.set(debugPort);

  var sockets = new (require("ws").Server)({ port: _.model.port() })
  sockets.on('connection', _.connect)

  _.model.app()().main();

})
