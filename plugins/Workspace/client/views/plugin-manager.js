module.exports = function (state) {

  return h('table.Taskbar_PluginManager', $.pluginOrder.map(plugin));

  function plugin (name) {
    return h('tr.Taskbar_PluginManager_Item',
      [ h('td.Taskbar_PluginManager_Item_Name',   name)
      , h('td.Taskbar_PluginManager_Item_Client', 'on')
      , h('td.Taskbar_PluginManager_Item_Server', '--')
      ]) }

}
