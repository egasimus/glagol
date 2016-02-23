(function () {

  // connect to server
  var keepAlive
    , socket = new WebSocket($.options.socketUrl);
  socket.onclose =
    function () {
      if (keepAlive) keepAlive = window.clearInterval(keepAlive)
      $.state.server.set(false) };
  socket.onopen =
    function () {
      keepAlive = window.setInterval(function () { socket.send("ping"); }, 30000)
      $.state.server.set(true) };

  $.state.connection.set(require('q-connection')(socket));

  return socket;

})
