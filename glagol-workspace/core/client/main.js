Glagol.events.once('changed', _.lib.reload(__filename));

module.exports = function main (global) {

  global = global || window;

  _.lib.insertCssLive(Glagol.get('styles/reset.styl'),   'Core');
  _.lib.insertCssLive(Glagol.get('styles/default.styl'), 'Core');

  var App = global.App = {};

  App.Model = require('riko-mvc/model')({});

  _.pluginOrder.forEach(_.lib.initPlugin(App));

  App.View = require('riko-mvc/view')(App.Model, function render (state) {
    var views  = _.plugins.Workspace.views
      , loaded = _.plugins.Workspace.model().Status === 'OK'
    return views[loaded ? 'app' : 'loading'](state);
  });

  document.body.innerHTML = "";
  document.body.appendChild(App.View.target);

  _.plugins.Workspace.model.Status.set('OK'); // HACK

}
