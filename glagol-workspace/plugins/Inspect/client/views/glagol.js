(function (frame, index) {

  var address   = frame.address
    , socket    = App.model.sockets()[address] || {}
    , connected = socket.status === 'connected'
    , visible   = App.model.visibleColumns()
    , expanded  = App.model.displayOptions()['expanded view']

  var headerColumns =
    expanded
    ? [ header('name_')
      , header('source')
      , header('compiled')
      , header('value')
      , header('format')
      , header('options') ]
    : [ header('name and source')
      , header('format and compiled')
      , header('value')
      , header('options') ];

  return h('.Glagol' + (connected ? '' : '.Disconnected'),
    connected
    ? h('.GlagolBody',
        h('table', { cellSpacing: 0 },
          [ h('tr', headerColumns)
          , _.glagolTree(frame.root, socket.socket) ]))
    : h('.GlagolConnect', { onclick: connect },
      [ h('.GlagolConnectIcon', '⌛')
      , h('.GlagolConnectText',
        [ socket.status || 'disconnected'
        , socket.error ? ' (' + socket.error + ')' : '' ])
      ]));

  function header (name) {
    return !!visible[name] ? h('th', name) : null;
  }

  function connect (event) {
    event.preventDefault();
    $.commands.connect(address).then($.commands.initGlagol(index, address));
  }

})
