(function (state) {

  state = state || {};

  return state.frames.length > 0
    ? h('.App',
        [ h('.MainView',
            [ h('.Frames',
                state.frames.map(_.frame))
            , _.sidebar(state)
            //, h('.FramesToolbar')
            ])
        //, _.statusBar(state)
        ])
    : _.welcome(state) ;

})
