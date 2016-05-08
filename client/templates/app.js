(function (state) {

  state = state || {};

  return state.Session.frames.length > 0
    ? h('.App',
        [ _.topbar(state)
        , h('.MainView',
            [ h('.Frames',
                state.Session.frames.map(_.frame))
            , _.sidebar(state)
            //, h('.FramesToolbar')
            ])
        //, _.statusBar(state)
        ])
    : _.welcome(state) ;

})
