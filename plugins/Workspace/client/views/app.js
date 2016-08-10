(function (state) {

  state = state || {};

  if (state.Workspace.Status === "loading") return _.loading(state);

  return state.Workspace.loading
    ? _.loading(state)
    : h('.App',
        [ _.launcher(state)
        , _.taskbar(state)
        , h('.MainView',
            [ _.switcher(state)
            , h('.Workspace',
                Object.keys(state.Workspace.Frames).map(
                  function (i) {
                    return _.frame(state.Workspace.Frames[i], i) }))
            ])
        ]);

})
