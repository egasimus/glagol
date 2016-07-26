(function (rel, subdir) {

  var glagol  = require('glagol')
    , plugins = glagol.Directory('plugins');

  require('fs').readdirSync(rel('plugins')).forEach(function (pluginName) {
    $.log('trying to load plugin', pluginName);
    try {
      var pluginPath = rel('plugins/' + pluginName + '/' + subdir)
        , plugin     = glagol(pluginPath);
      Object.defineProperty(plugin, 'name', { value: pluginName }); // rename
      plugin.reset(); // after rename
      plugins.add(plugin);
    } catch (e) {
      $.log.error('could not load plugin', pluginPath);
      $.log.error(e);
    }
  });

  return plugins;

})
