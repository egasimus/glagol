(function (state) {

  state = state || {};

  return Object.keys(state.sessions).length > 0
    ? h('.App',
        [ h('.MainView',
            Object.keys(state.sessions).map(_.session.bind(null, state)))
        , _.statusBar(state) ])
    : _.welcome() ;

})
