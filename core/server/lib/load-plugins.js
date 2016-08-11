module.exports = function (rel, subdir) {

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
      if (e.code === 'FILE_NOT_FOUND') {
        $.log.warn('could not find', pluginPath);
      } else {
        $.log.error('could not load plugin',
          pluginPath + "\n" + e.message + "\n" + e.stack);
      }
    }
  });

  return plugins;

}
