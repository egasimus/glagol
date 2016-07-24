Glagol.events.once('changed', _.reload(__filename));

module.exports = function (App) {

  return function (name) {

    var pluginRoot = Glagol.get('../plugins').get(name);
    if (!pluginRoot) return console.warn('no plugin', name);

    // make views directory special
    var views = pluginRoot.get('views');
    if (views) {
      // globals for easier templating. maybe just remove
      views.options = require('extend')(views.options, {
        globals: function (file) { return {
          App:  App,
          emit: function () { return _.emit.apply(null, arguments) },
          h:    function () { return _.h.apply(null, arguments) } } } })

      // live reload when editing views
      views.events.onAny(function () {
        console.debug('template edited, refreshing');
        App.View.update(App.Model());
      })
    }

    // make model globally accessible via App.Model
    var model = pluginRoot().model;
    if (model) App.Model.put(name, model);

    // if plugin has stylesheet, add it to the document head
    // TODO custom auto-updating format for stylesheets
    var style = pluginRoot.get('style.styl') || pluginRoot.get('style.css');
    if (style) {
      _.insertCssLive(style, name);
    } else {
      pluginRoot.events.on('added', function installCss (node) {
        if (node.name === 'style.styl' || node.name === 'style.css') {
          _.insertCssLive(style, name);
          pluginRoot.events.off('added', installCss);
        }
      })
    }

    // execute entry point
    var entryPoint = pluginRoot.get('init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }

  }

}
