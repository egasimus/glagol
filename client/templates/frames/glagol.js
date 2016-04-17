(function (frame, index) {

  var address = frame.address
    , socket = App.model.sockets()[address] || {}
    , connected = socket.status === 'connected';

  return h('.Glagol' + (connected ? '' : '.Disconnected'),
    connected
    ? h('.GlagolBody',
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
    $.commands.connect(address).then($.commands.initGlagol(index, address));
  }

})
