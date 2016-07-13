Glagol.events.once('changed', _.reload(__filename));

module.exports = function (App) {

  return function (name) {

    var moduleRoot = Glagol.get('modules').get(name);

    // views directory is special
    var views = moduleRoot.get('views');
    if (views) {
      // globals for easier templating. maybe just remove
      views.options = require('extend')(views.options, {
        globals: function (file) { return {
          emit: function () { return _.util.emit.apply(null, arguments) },
          h:    function () { return _.util.h.apply(null, arguments) } } } })

      // live reload when editing views
      views.events.onAny(function () {
        App.View.Update(App.Model());
      })
    }

    var entryPoint = moduleRoot.get('init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }

  }

}
