(function (state, App) {

  state = state || {};

  var appStyle =
    { fontFamily: 'monospace', fontSize: '10px' }

  var tableStyle =
    { margin: 0
    , fontSize: '12px'
    , minWidth: '100%' }

  var cellStyle =
    { textAlign: 'left'
    , verticalAlign: 'top' }

  var headerStyle =
    { textAlign: 'left'
    , verticalAlign: 'top'
    , fontWeight: 'bold' }

  var blankBodyStyle =
    { height:         '100%'
    , display:        'flex'
    , flexDirection:  'column'
    , justifyContent: 'center'
    , alignItems:     'center' }

  var buttonStyle =
    { fontFamily: 'monospace'
    , fontWeight: 'bold'
    , background: 'white'
    , border: '2px solid #555'
    , color: '#111'
    , margin: '3px'
    , padding: '3px 6px'
    , cursor: 'pointer' }

  var inputStyle =
    { fontFamily: 'monospace'
    , fontWeight: 'bold'
    , background: 'white'
    , border: 'none'
    , borderBottom: '2px solid #aaa'
    , textAlign: 'center'
    , color: '#333' }

  var tabBarStyle =
    { display: 'flex' }

  var tabStyle =
    { flexGrow: 1
    , fontSize: '12px'
    , padding: '6px 3px'
    , borderBottom: '2px solid #555' }

  var tabAddStyle =
    { flexGrow: 0
    , width: '36px'
    , lineHeight: '24px'
    , fontSize: '36px'
    , fontWeight: 'bold'
    , textAlign: 'center'
    , cursor: 'pointer'
    , color: '#aaa' }

  var body;
  if (Object.keys(state.sessions).length > 0) {
    console.log(state)
    body =
      h('.Body',
        [ h('.TabBar',
          { style: tabBarStyle },
          Object.keys(state.sessions).map(function (id) {
            var session = state.sessions[id];
            return h('.Tab', { style: tabStyle }, String(session.address));
          }).concat([ h('.TabAdd', { style: tabAddStyle }, '+') ]))
        , state.focusedSession
          ? h('table',
            { style: tableStyle },
            [ h('tr',
              [ h('th', { style: headerStyle }, 'name')
              , h('th', { style: headerStyle }, 'source')
              , h('th', { style: headerStyle }, 'compiled')
              , h('th', { style: headerStyle }, 'value') ])
            ].concat(
              Object.keys(state.sessions[state.focusedSession].data).map(
                function (id) {
                  var data = state.sessions[state.focusedSession].data[id];
                  return h('tr',
                    [ h('td', { style: cellStyle }, id)
                    , h('td', { style: cellStyle }, data) ]) })))
          : '' ])

  } else {
    body =
      h('.Body',
        { style: blankBodyStyle },
        [ h('h1', 'Glagol Inspector')
        , h('form',
          [ h('input#session-id',
            { style:       inputStyle
            , type:        'text'
            , placeholder: '[HOST:]PORT' })
          , h('button',
            { style:   buttonStyle
            , onclick: function (e) {
                e.preventDefault();
                connect(document.getElementById('session-id').value); } }
            , 'connect')]) ]);
  }

  return h('.App', { style: appStyle }, body);

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
