(function () {

  // connection info is stored in app state;
  // reconnect if state is re-initialized
  Glagol.nodes['state.js'].events.on('changed', $.util.connect);

  // connect to server
  var keepAlive
    , socket = new WebSocket("ws://localhost:1618");
  socket.onclose = function () {
    if (keepAlive) keepAlive = window.clearInterval(keepAlive)
    $.state.server.set(false)
  };
  socket.onopen  = function () {
    keepAlive = window.setInterval(function () { socket.send("ping"); }, 30000)
    $.state.server.set(true)
  };
  $.state.connection.set(require('q-connection')(socket));

  return socket;

})
