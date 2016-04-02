(function connect (address) {

  var connections = [];

  return new Promise(
    function (win, fail) {
      console.debug('connect to session', address);
      API('connect', address).done(function (address) {
        console.debug("opened session for", address)
        var socket = new WebSocket(address)
          , connection;
        socket.onopen = function () {
          App.model.sockets.put(address,
            { socket:     socket
            , connection: connection });
          socket.onclose = App.model.sockets.delete(address);
          socket.onerror = null;
          connection.fcall().then(function (app) {
            app.get('nodes').done(function (kek) { console.log("kek", kek )});
          });
          win(address, socket, connection);
        }
        connection = require('q-connection')(socket);
        connections.push(connection); }) });

        //$.lib.socket(address).then(
          //function (socket) {
            ////socket.onmessage = function () {
              ////socket.onmessage = null;
              //var connection = require('q-connection')(socket);
              //App.model.sockets.put(address, connection);
              ////socket.send('');
              //console.debug("opened socket to", address, socket, connection);
              ////connection.then(function (lol) { console.log("lol", lol)
              //win(address, connection);
            ////}
          //},
          //function (socket) {
            //console.error("could not open socket to", address);
            //fail(address);
          //}) }) });

})
