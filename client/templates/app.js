(function (state) {

  state = state || {};

  return Object.keys(state.sessions).length > 0
    ? h('.App',
        [ _.tabBar(state) 
        , _.session(state)
        , _.statusBar(state) ])
    : _.welcome() ;

})
