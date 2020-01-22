module.exports = function (state) {

  return h('table.Taskbar_PluginManager', $.pluginOrder.map(plugin));

  function plugin (name) {
    return h('tr.Taskbar_PluginManager_Item',
      [ h('td', h('.Taskbar_PluginManager_Item_Name',    name))
      , h('td', h('.Taskbar_PluginManager_Item_Status', 'client'))
      , h('td', h('.Taskbar_PluginManager_Item_Status', 'server'))
      ]) }

}
