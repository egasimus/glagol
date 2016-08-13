Glagol.events.once('changed', _.reload(__filename));

module.exports = function (App) {

  return function (name) {

    console.groupCollapsed('loading plugin', name);

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
    // if not, hope for one to appear
    // TODO custom auto-updating format for stylesheets (??)
    var style =
      pluginRoot.get('style.styl') ||
      pluginRoot.get('style.css');

    if (style) {
      addStyle(style);
    } else {
      console.debug('no stylesheet for', name)
      pluginRoot.events.on('added', expectStyle);
    }

    function addStyle (style) {
      console.debug('introducing stylesheet for', name, ':', style.path)
      _.insertCssLive(style);
    }

    function expectStyle (node) {
      if (node.name === 'style.styl' || node.name === 'style.css') {
        addStyle(node);
        pluginRoot.events.off('added', expectStyle);
      }
    }

    // execute entry point
    var entryPoint = pluginRoot.get('init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }

    console.groupEnd();

  }

}
