(function () {

  var socketId = 0
    , connections = [];

  return function (socket) {
    var id = socketId++;
    console.log('socket', id, 'connected');
    socket.onclose = function () { console.log('socket', id, 'closed'); }
    connections.push(require('q-connection')(socket, function () {
      var app = _.app();
      console.log("GET APP", app);
      return app;
    }));
  }

})()
