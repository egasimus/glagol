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
                Object.keys(state.Workspace.frames).map(
                  function (id) { return _.frame(state.Workspace.frames[id]) }))
            ])
        //, _.bars.bottom(state)
        ]);

})
