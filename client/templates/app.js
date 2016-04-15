(function (state) {

  state = state || {};

  return Object.keys(state.sessions).length > 0
    ? h('.App',
        [ h('.TabBar',
          Object.keys(state.sessions).map(function (id) {
            var session = state.sessions[id] || {}
              , address = String(session.address);
            return h('.Tab.Active',
              { dataset: { address: address }
              , onclick: focusSession },
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
            ].concat(_.tree(state.sessions[state.focusedSession].root)))
          : '' ])
    : h('.App.Blank',
        [ h('h1', 'Glagol Inspector')
        , h('form',
          [ h('input#session-id',
            { type:        'text'
            , placeholder: '[HOST:]PORT' })
          , h('button',
            { onclick: function (event) {
                event.preventDefault();
                var address = document.getElementById('session-id').value
                $.commands.connect(address); } }
            , 'connect')]) ]);

  function focusSession (event) {
    App.model.put('focusedSession', getAddress(event)); }

  function connect (event) {
    var address = getAddress(event);
    $.commands.connect(address).then(function (socket) {
      socket.addEventListener('message', function (message) {
        if (message.data.indexOf('update%') === 0)
          $.commands.updateSession(
            address, JSON.parse(message.data.slice(7))) });
      socket.send('subscribe'); }); }

  function disconnect (event) {
    $.commands.disconnect(getAddress(event)); }

  function remove (event) {
    $.commands.remove(getAddress(event)); }

  function getAddress (event) {
    event.preventDefault();
    return event.target.dataset.address ||
      event.target.parentElement.dataset.address; }

})
