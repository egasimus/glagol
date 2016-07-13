Glagol.events.once('changed', _.reload(__filename));

module.exports = function main () {

  var App = {};

  App.Model = require('riko-mvc/model')({});

  _.moduleOrder.forEach(_.initModule(App));

  App.View = require('riko-mvc/view')(App.Model, function render (state) {
    var views  = _.modules.Workspace.views
      , loaded = _.modules.Workspace.model().Status === 'OK'
    return views[loaded ? 'app' : 'loading'](state);
  });

  _.modules.Workspace.model.Status.set('OK'); // HACK

}
