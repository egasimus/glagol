(function (state) {

  state = state || {};

  return state.Workspace.loading
    ? _.loading(state)
    : h('.App',
        [ _.bars.top(state)
        , h('.MainView',
            [ _.bars.left(state)
            , h('.Workspace',
                state.Workspace.frames.map(_.frame))
            ])
        //, _.statusBar(state)
        ]);

})
