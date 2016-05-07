(function (state) {

  state = state || {};

  return state.frames.length > 0
    ? h('.App',
        [ _.topbar(state)
        , h('.MainView',
            [ h('.Frames',
                state.frames.map(_.frame))
            , _.sidebar(state)
            //, h('.FramesToolbar')
            ])
        //, _.statusBar(state)
        ])
    : _.welcome(state) ;

})
