(function connect (address) {

  var connections = [];

  return new Promise(
    function (win, fail) {
      console.debug('opening session for', address);
      API('connect', address).done(function (address) {
        console.debug('connecting to remote debugger at', address);
        var socket     = new WebSocket(address)
          , connection = require('q-connection')(socket);
        socket.onclose = socket.onerror = error(fail, address);
        socket.onopen  = opened(win, address, socket);
        App.model.sockets.put(address,
          { status:     'connecting'
          , address:    address
          , socket:     socket
          , connection: connection }) }) });

  function error (fail, address) {
    return function () {
      var model = App.model.sockets[address];
      model.put('status', 'failed');
      fail('could not connect', model); } }

  function opened (win, address) {
    return function () {
      var model = App.model.sockets[address];
      model.put('status', 'connected');
      console.debug('opened socket', model().address);
      socket.onerror = socket.onclose = closed(model().address);
      model().connection.get('path').done(ask);
      win(model); } }

  function closed (address) {
    return function () {
      var model = App.model.sockets[address];
      App.model.sockets[address].put('status', 'closed'); } }

  function ask (app) {
    console.log("ask", app);
    app.get('nodes').done(function (nodes) { console.log("nodes", nodes) }) }

})
