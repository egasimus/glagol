module.exports =
  { Digit1: nop('workspace switching')
  , Digit2: nop('workspace switching')
  , Digit3: nop('workspace switching')
  , Digit4: nop('workspace switching')
  , Digit5: nop('workspace switching')

  , KeyO: function () {
      App.Model.Workspace.bars.top.input.set(['Open']);
    },
    KeyR: function () {
      App.Model.Workspace.bars.top.input.set(['Run']);
    }
  , KeyS: function () { console.log('save') }
  , KeyH: go(-1)
  , KeyJ: nop('J')
  , KeyK: nop('K')
  , KeyL: go(1)
  };

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

function nop (op) { return function () { console.info(op, 'not implemented') } };
