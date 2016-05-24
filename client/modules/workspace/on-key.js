module.exports = onKey;

function onKey (direction, event) {

  console.debug(direction, event);

  if (event.code === 'Backslash') {
    event.preventDefault();
    App.Model.Workspace.bars.top.show.set(!App.Model.Workspace.bars.top.show());
  } else if (App.Model.Workspace.bars.top.show()) {
    return;
  }

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
