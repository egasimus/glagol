module.exports = function (state) {
  return h('.Taskbar_PluginManager', $.pluginOrder.map(plugin));

  function plugin (name) {
    return h('.Taskbar_PluginManager_Item', name)
  }
}
