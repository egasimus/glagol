(function (state) {

  state = state || {};

  return Object.keys(state.sessions).length > 0
    ? h('.App',
        [ h('.TabBar',
          Object.keys(state.sessions).map(function (id) {
            var session = state.sessions[id] || {}
              , address = String(session.address);
            return h('.Tab.Active',
              { dataset: { address: address } },
              [ h('.TabText', address)
              , (state.sockets[address]
                && state.sockets[address].status === 'connected')
                ? h('.TabConnected',    { onclick: disconnect })
                : h('.TabNotConnected', { onclick: connect    })
              , h('button.TabClose',    { onclick: remove     }, '×') ]);
          }).concat([ h('.TabAdd', '+') ]))
        , state.focusedSession
          ? h('table',
            [ h('tr',
              [ h('th', 'name')
              , h('th', 'format')
              , h('th', 'source')
              , h('th', 'compiled')
              , h('th', 'value')
              , h('th', 'options')
              ])
            ].concat(
              Object.keys(state.sessions[state.focusedSession].data || {}).map(
                function (id) {
                  var data = state.sessions[state.focusedSession].data[id];
                  return h('tr',
                    [ h('td.NodeName', id)
                    , h('td', 'JavaScript')
                    , h('td', data)
                    , h('td', h('a.ButtonLink', 'compile'))
                    , h('td', h('a.ButtonLink', 'run'))
                    , h('td')
                    ]) })))
          : '' ])
    : h('.App.Blank',
        [ h('h1', 'Glagol Inspector')
        , h('form',
          [ h('input#session-id',
            { type:        'text'
            , placeholder: '[HOST:]PORT' })
          , h('button',
            { onclick: function (e) {
                e.preventDefault();
                var address = document.getElementById('session-id').value
                $.commands.connect(address); } }
            , 'connect')]) ]);

  function connect (e) {
    var address = eventToAddress(e);
    $.commands.connect(address).then(function (socket) {
      socket.addEventListener('message', function (message) {
        if (message.data.indexOf('update%') === 0)
          $.commands.updateSession(
            address, JSON.parse(message.data.slice(7))) });
      socket.send('subscribe'); }); }

  function disconnect (e) {
    $.commands.disconnect(eventToAddress(e)); }

  function remove (e) {
    $.commands.remove(eventToAddress(e)); }

  function eventToAddress (e) {
    e.preventDefault();
    return e.target.parentElement.dataset.address; }

})
