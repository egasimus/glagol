var _App;

Glagol.events.once('changed', function () {
  console.debug('edited service updater');
  if (_App) _App.API('Service/Refresh');
});

module.exports = function (App, newState) {

  _App = App;

  console.debug("updating services:", newState);

  _.model.set($.lib.model(newState));

}
