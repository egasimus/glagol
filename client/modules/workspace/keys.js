module.exports =
  { KeyH: go(-1)
  , KeyL: go(1)
  , Alt:
    { KeyR: toggleLauncher } }

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
  App.Model.Workspace.bars.top.show.set(!App.Model.Workspace.bars.top.show());
}
