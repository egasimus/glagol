(function connect (address) {
  console.debug('connect to session', address);
  API('connect', address).done(function (address) {
    console.debug("opened session for", address)
    $.lib.socket(address).then(
      function (socket) {
        console.debug("opened socket to", address, socket);
        App.model.sockets.put(address, socket);
        console.log("=>", App.model())
        socket.onclose = App.model.sockets.delete('address');
      },
      function (socket) {
        console.error("could not open socket to", address);
      })
    //App.model.sessions.put(address, { address: address });
    //App.model.focusedSession.set(address);
    //API('fetch', address).done(function (data) {
      //data = JSON.parse(data);
      //console.debug("fetched data for", address, data);
      //App.model.sessions[address].put('data', data);
    //})
  });
})
