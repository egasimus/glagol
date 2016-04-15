(function connect (address) { return new Promise(function (win, fail) {

  console.debug('opening session for', address);

  API('connect', address).done(init);

  function init (address) {
    console.debug('connecting to remote debugger at', address);
    App.model.sockets.put(address,
      { status: 'connecting'
      , address: address });
    App.model.sockets[address].put('socket', require('extend')(
      new WebSocket(address),
      { onopen:    onopen
      , onclose:   onerror
      , onerror:   onerror
      , onmessage: onmessage }));
    App.model.sockets[address].status(function (status) {
      console.debug('socket', address, 'status', status); }) };

  function onopen () {
    App.model.sockets[address].status.set('handshaking');
    App.model.sockets[address].socket().send('hello'); }

  function onmessage (message) {
    if (message.data === 'hi') {
      App.model.sockets[address].status.set('connected');
      App.model.sockets[address].socket().onmessage =
        function () { $.api(address).apply(null, arguments) };
      win(socket); } }

  function onerror () {
    return function () {
      var model = App.model.sockets[address];
      model.put('status', 'failed');
      fail('could not connect', model); } } } ); });
