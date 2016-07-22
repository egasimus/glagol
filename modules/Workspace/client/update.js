var _App;

Glagol.events.once('changed', function () {
  console.debug('edited workspace updater');
  if (_App) _App.API('Workspace/Refresh');
});

module.exports = function (App, newState) {

  _App = App;

  console.debug("updating workspace:", newState);

  var newFrames = []
    , userId    = __.Auth.model().UserId
    , user      = newState.Users[userId];
  user.Frames.forEach(function (id) {
    var frame = newState.Frames[id];
    if (frame) newFrames.push(frame);
  })

  _.model.put("Frames", $.lib.model(newFrames));

}
