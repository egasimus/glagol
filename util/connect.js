(function (App) {

  // reconnect if model or socket is reset

  App.socket.events.once('changed', $.util.connect);
  App.model.events.once('changed', $.util.connect);

  // connect to server

  var keepAlive
    , socket = App.socket()
    , model = App.model();

  socket.onclose = function () {
    if (keepAlive) keepAlive = window.clearInterval(keepAlive)
    model.server.set(false) };

  socket.onopen = function () {
    keepAlive = window.setInterval(function () { socket.send("ping"); }, 30000)
    model.put('server', true) };

  model.put('connection', require('q-connection')(socket));

})
