module.exports = function (App) {

  App.Workspace.registerFrameType('machineList',   _.views.list);
  App.Workspace.registerFrameType('machineDetail', _.views.detail);

  App.Workspace.registerMenuItem('Machine list', 'machineList');

}
