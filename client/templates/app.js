(function (state) {

  state = state || {};

  return state.frames.length > 0
    ? h('.App',
        [ h('.MainView',
            [ h('.Frames',
                state.frames.map(_.frame)),
            , state.displayOptions['show sidebar'] ? _.sidebar(state) : null
            //, h('.FramesToolbar')
            ])
        //, _.statusBar(state)
        ])
    : _.welcome(state) ;

})
