(function connect (address) { return new Promise(function (win, fail) {

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
    console.debug('socket', address, 'status', status); })

  function onopen () {
    App.model.sockets[address].status.set('handshaking');
    App.model.sockets[address].socket().send('hello'); }

  function onmessage (message) {
    if (message.data === 'hi') {
      App.model.sockets[address].status.set('connected');
      win(App.model.sockets[address].socket()); } }

  function onerror (event) {
    var model = App.model.sockets[address];
    model.put('status', 'failed');
    if (event.type === 'close') model.put('error', event.code);
    fail('could not connect', model); } } ); });
