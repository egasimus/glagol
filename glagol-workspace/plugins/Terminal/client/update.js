var _App;

Glagol.events.once('changed', function () {
  console.debug('edited workspace updater');
  if (_App) _App.API('Workspace/Refresh');
});

module.exports = function (App, newState) {

  _App = App;

  console.debug("updating terminals:", newState);

  _.model.put("Instances", $.lib.model(newState.Instances));

}
