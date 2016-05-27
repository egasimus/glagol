module.exports = onKey;

var modHeld = false;

function onKey (state, direction, event) {

  state = state.Workspace.bars.top;

  console.log(state, direction, event.code);

  var up    = direction === 'up'
    , down  = direction === 'down'
    , model = App.Model.Workspace.bars.top;

  //console.debug(direction, event);

  var isMod = event.code === 'Backslash' ||
    (process.versions.electron &&
      (event.code === 'AltLeft' || event.code === 'AltRight'))

  console.log(isMod, down);

  if (isMod) {
    modHeld = down;
    if (!modHeld) event.preventDefault();
  } else if (modHeld) {
    if (down && _.commands.Keys[event.code]) _.commands.Keys[event.code]();
    return;
  }

  //---------------------------------------------------------------

  //var keys = _.keys;

  //if (event.superKey) keys = keys.Super || {};
  //if (event.ctrlKey)  keys = keys.Ctrl  || {};
  //if (event.altKey)   keys = keys.Alt   || {};
  //if (event.shiftKey) keys = keys.Shift || {};

  //if (keys[event.code]) {
    //event.preventDefault();
    //keys[event.code]();
  //}

}
