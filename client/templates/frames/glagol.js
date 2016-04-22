(function (frame, index) {

  var address = frame.address
    , socket = App.model.sockets()[address] || {}
    , connected = socket.status === 'connected'
    , visible = App.model.visibleColumns();

  return h('.Glagol' + (connected ? '' : '.Disconnected'),
    connected
    ? h('.GlagolBody',
        h('table', { cellSpacing: 0 },
          [ h('tr',
            [ header('name_')
            , header('source')
            , header('compiled')
            , header('value')
            , header('format')
            , header('options')
            ])
          ].concat(__.tree(frame.root, socket.socket))))
    : h('.GlagolConnect', { onclick: connect },
      [ h('.GlagolConnectIcon', '⌛')
      , h('.GlagolConnectText', 'disconnected') ]));

  function header (name) {
    return !!visible[name] ? h('th', name) : null;
  }

  function connect (event) {
    event.preventDefault();
    $.commands.connect(address).then($.commands.initGlagol(index, address));
  }

})
