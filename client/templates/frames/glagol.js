(function (frame, index) {

  var address = frame.address
    , socket = App.model.sockets()[address] || {}
    , connected = socket.status === 'connected';

  return h('.Glagol' + (connected ? '' : '.Disconnected'),
    connected
    ? h('.SessionBody',
        h('table',
          [ h('tr',
            [ h('th', 'name')
            , h('th', 'source')
            , h('th', 'compiled')
            , h('th', 'value')
            , h('th', 'format')
            , h('th', 'options')
            ])
          ].concat(__.tree(frame.root))))
    : h('.GlagolConnect', { onclick: connect },
      [ h('.GlagolConnectIcon', '⌛')
      , h('.GlagolConnectText', 'disconnected') ]));

  function connect (event) {
    event.preventDefault();
    $.commands.connect(address).then(function () {
      var socket = App.model.sockets[address].socket();
      socket.addEventListener('message', function (message) {
        if (message.data.indexOf('update%') === 0)
          $.commands.updateSession(
            index, JSON.parse(message.data.slice(7))) });
      socket.send('subscribe'); });
  }

})


//(function (state, id) {

  //var session = state.sessions[id]
    //, socket  = state.sockets[id] || { status: 'not connected' };

  //return h('.Session',
    //{ dataset: { id: id } },
    //[ h('.SessionHeader',
      //[ h('.SessionTitle', id)
      //, h('.SessionStatus',
          //{ onclick: socket.status !== 'connected' ? connect : disconnect },
          //socket.status) ])
    //, h('.SessionBody',
        //h('table',
          //[ h('tr',
            //[ h('th', 'name')
            //, h('th', 'source')
            //, h('th', 'compiled')
            //, h('th', 'value')
            //, h('th', 'format')
            //, h('th', 'options')
            //])
          //].concat(_.tree(state.sessions[id].root)))) ])

  //function connect (event) {
    //event.preventDefault();
    //$.commands.connect(id).then(function (socket) {
      //socket.addEventListener('message', function (message) {
        //if (message.data.indexOf('update%') === 0)
          //$.commands.updateSession(
            //id, JSON.parse(message.data.slice(7))) });
      //socket.send('subscribe'); });
  //}

  //function disconnect (event) {
    //event.preventDefault();
    //$.commands.disconnect(id);
  //}

//});
