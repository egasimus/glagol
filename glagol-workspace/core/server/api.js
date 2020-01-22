(function (state, respond) {

  var API = {};

  Object.keys($.plugins).forEach(function (pluginName) {
    var plugin = $.plugins[pluginName];
    if (!plugin || typeof plugin.api !== 'function') return;
    var pluginApi = plugin.api(state, respond);
    Object.keys(pluginApi).forEach(function (key) {
      API[pluginName + '/' + key] = pluginApi[key];
    })
  })

  return API;

})
