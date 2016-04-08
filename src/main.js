(function (state) {

  // debugger state
  var state = state ||
    { app:    null
    , path:   null
    , port:   null
    , socket: null };

  // enable live editing
  //Glagol.events.once('changed', function (self) {
    //if (server) {
      //server.http.removeListener("listening", listening);
      //server.sockets.removeListener("connection", connection);
    //}
    //self()(state);
  //})

  // parse path
  var appPath = require('path').resolve(process.argv[2]);
  $.log('loading', appPath);

  // load app
  state.app = require(appPath);
  $.log('loaded app from', appPath);

  // parse port
  var debugPort = process.argv[3] || 1616;
  $.log('listening on port', debugPort);
  state.port = debugPort;

  // start socket server
  var sockets = new (require("ws").Server)({ port: state.port })
  sockets.on('connection', connect);

  // launch app TODO async?
  state.app().main();

  // socket numbers
  var socketId = 0;

  function connect (socket) {
    // get socket id
    var id = socketId++;
    $.log('socket', id, 'opened');

    // set close handler
    socket.onclose = function () { console.log('socket', id, 'closed'); }

    // expose app for remote access
    var connection = require('q-connection')(socket, function () {
      return _.serialize(state.app) });
  }

})
