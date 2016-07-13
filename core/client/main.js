Glagol.events.once('changed', _.reload(__filename));

module.exports = function main () {

  var App = {};

  App.addStyleSheet = function () {
    console.debug.apply(console, ['Adding stylesheet:'].concat(arguments));
    document.head.appendChild($.lib.cdnStylesheet.apply(null, arguments));
  }

  _.moduleOrder.forEach(function initModule (name) {
    var rootDir    = Glagol.get('modules').get(name)
      , entryPoint = rootDir.get('init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }
  })

  _.modules.Workspace.model.Status.set('OK'); // HACK

}
