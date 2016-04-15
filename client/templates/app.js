(function (state) {

  state = state || {};

  return Object.keys(state.sessions).length > 0
    ? h('.App',
        [ h('.MainView',
            [ h('.Sessions',
                Object.keys(state.sessions).map(_.session.bind(null, state))) 
            , _.sidebar(state)
            //, h('.SessionsToolbar')
            ])
        , _.statusBar(state) ])
    : _.welcome() ;

})
