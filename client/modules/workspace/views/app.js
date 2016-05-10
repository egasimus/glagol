(function (state) {

  state = state || {};

  if (state.Workspace.loading) return _.loading(state);

  return state.Workspace.loading
    ? _.loading(state)
    : h('.App',
        [ bar('top')
        , h('.MainView',
            [ bar('left')
            , h('.Workspace',
                state.Workspace.frames.map(_.frame))
            ])
        , bar('bottom')
        ]);

  function bar (side) {
    return state.Workspace.bars[side].show ? _.bars[side](state) : '';
  }

})
