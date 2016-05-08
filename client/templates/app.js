(function (state) {

  state = state || {};

  return state.Workspace.frames.length > 0
    ? h('.App',
        [ _.bars.top(state)
        , h('.MainView',
            [ _.bars.left(state)
            , h('.Workspace',
                state.Workspace.frames.map(_.frame))
            ])
        //, _.statusBar(state)
        ])
    : _.welcome(state) ;

})
