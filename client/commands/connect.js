(function connect (address) {
  console.debug('connect to session', address);
  API('connect', address).done(function (address) {
    console.debug("connected to", address)
    App.model.sessions.put(address, { address: address });
    App.model.focusedSession.set(address);
    API('fetch', address).done(function (data) {
      data = JSON.parse(data);
      console.debug("fetched data for", address, data);
      App.model.sessions[address].put('data', data);
    })
  });
})
