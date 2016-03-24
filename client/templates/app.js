(function (state, App) {

  state = state || {};

  var body;
  if (Object.keys(state.sessions).length > 0) {
    console.log(state)
    body =
      h('.Body',
        [ h('.TabBar',
          Object.keys(state.sessions).map(function (id) {
            var session = state.sessions[id] || {};
            return h('.Tab', String(session.address));
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
                    [ h('td', id)
                    , h('td', 'JavaScript')
                    , h('td', data)
                    , h('td', h('a.ButtonLink', 'compile'))
                    , h('td', h('a.ButtonLink', 'run'))
                    ]) })))
          : '' ])

  } else {
    body =
      h('.Body.Blank',
        [ h('h1', 'Glagol Inspector')
        , h('form',
          [ h('input#session-id',
            { type:        'text'
            , placeholder: '[HOST:]PORT' })
          , h('button',
            { onclick: function (e) {
                e.preventDefault();
                connect(document.getElementById('session-id').value); } }
            , 'connect')]) ]);
  }

  return h('.App', body);

  function connect (address) {
    console.debug('connect to session', address);
    API('session/connect', address).done(function (address) {
      console.debug("connected to", address)
      App.model.sessions.put(address, { address: address });
      App.model.focusedSession.set(address);
      API('session/fetch', address).done(function (data) {
        data = JSON.parse(data);
        console.debug("fetched data for", address, data);
        App.model.sessions[address].put('data', data);
      })
    });
  }

})
