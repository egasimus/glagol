Glagol.events.once('changed', _.reload(__filename));

module.exports = function (App) {

  return function (name) {

    var pluginRoot = Glagol.get('plugins').get(name);

    // make views directory special
    var views = pluginRoot.get('views');
    if (views) {
      // globals for easier templating. maybe just remove
      views.options = require('extend')(views.options, {
        globals: function (file) { return {
          App:  App,
          emit: function () { return _.util.emit.apply(null, arguments) },
          h:    function () { return _.util.h.apply(null, arguments) } } } })

      // live reload when editing views
      views.events.onAny(function () {
        App.View.update(App.Model());
      })
    }

    // make model globally accessible via App.Model
    var model = pluginRoot().model;
    if (model) App.Model.put(name, model);

    // if plugin has stylesheet, add it to the document head
    // TODO custom auto-updating format for stylesheets
    var style = pluginRoot.get('style.styl') || pluginRoot.get('style.css');
    if (style) _.util.insertCssLive(style, name);

    // execute entry point
    var entryPoint = pluginRoot.get('init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }

  }

}
