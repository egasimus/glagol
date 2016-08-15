module.exports = function (state) {

  state = state || {};
  if (state.Workspace.Status === "loading") return _.loading(state);

  var frames    = Object.keys(state.Workspace.Frames)
    , workspace = h('.Workspace', frames.map(frame))
    , mainView  = h('.MainView', [ _.switcher(state), workspace ]);

  return h('.App', [ _.taskbar(state), mainView ]);

  function frame (i) { return _.frame(state.Workspace.Frames[i], i) }

}
