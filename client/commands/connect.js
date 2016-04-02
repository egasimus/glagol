(function connect (address) {

  return new Promise(
    function (win, fail) {
      console.debug('connect to session', address);
      API('connect', address).done(function (address) {
        console.debug("opened session for", address)
        $.lib.socket(address).then(
          function (socket) {
            console.debug("opened socket to", address, socket);
            socket.onclose = App.model.sockets.delete('address');
            var connection = require('q-connection')(socket);
            App.model.sockets.put(address, connection);
            //socket.send('');
            connection.get('name').then(function (name) { console.log("==>", name) }).catch(function (err) { console.log("ERR",err) })
            win(address, connection);
          },
          function (socket) {
            console.error("could not open socket to", address);
            fail(address);
          }) }) });

})
