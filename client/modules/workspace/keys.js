module.exports =
  { AltLeft:  toggleLauncher
  , AltRight: toggleLauncher
  , Alt:
    { KeyH: go(-1)
    , KeyL: go(1) } };

function go (by) {
  return function () {
    var Model      = App.Model.Workspace
      , frameCount = Model.frames().length
      , nextFrame  = Model.focusedFrame() + by;
    if (nextFrame < 0)           nextFrame += frameCount;
    if (nextFrame >= frameCount) nextFrame -= frameCount;
    Model.focusedFrame.set(nextFrame);
  }
}

function toggleLauncher () {
  console.log(" blob")
  App.Model.Workspace.bars.top.show.set(!App.Model.Workspace.bars.top.show());
}
