(function (state) {

  state = state || {};

  if (state.Workspace.loading) return _.loading(state);

  return state.Workspace.loading
    ? _.loading(state)
    : h('.App',
        [ _.bars.top(state)
        , h('.MainView',
            [ //bar('left')
            , h('.Workspace',
                state.Workspace.frames.map(_.frame))
            ])
        , _.bars.bottom(state)
        ]);

})
