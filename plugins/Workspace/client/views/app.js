(function (state) {

  state = state || {};

  if (state.Workspace.Status === "loading") return _.loading(state);

  return state.Workspace.loading
    ? _.loading(state)
    : h('.App',
        [ _.launcher(state)
        , h('.MainView',
            [ _.switcher(state)
            , h('.Workspace',
                Object.keys(state.Workspace.Frames).map(
                  function (id) { return _.frame(state.Workspace.Frames[id]) }))
            ])
        , _.taskbar(state)
        ]);

})
