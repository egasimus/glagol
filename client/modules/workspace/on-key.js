module.exports = onKey;

function onKey (direction, event) {

  var up    = direction === 'up'
    , down  = direction === 'down'
    , model = App.Model.Workspace.bars.top;

  //console.debug(direction, event);

  if (event.code === 'Backslash') {
    if (!model.show()) event.preventDefault();
    model.show.set(down || (model.input().length > 0));
  } else if (model.show()) {
    if (_.commands.Keys[event.code]) _.commands.Keys[event.code]();
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
