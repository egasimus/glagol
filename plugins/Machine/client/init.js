module.exports = function (App) {

  App.Workspace.registerFrameType('machineList',
    function () { return _.views.list.apply(null, arguments) });
  App.Workspace.registerFrameType('machineDetail',
    function () { return _.views.detail.apply(null, arguments) });

  App.Workspace.registerMenuItem('Machine list',
    function () { App.API('Workspace/Open', 'machineList') });

}
