module.exports = function (App) {

  App.Workspace.registerFrameType('deviceList',   _.views.list);
  App.Workspace.registerFrameType('deviceDetail', _.views.detail);

  App.Workspace.registerMenuItem('Device list',
    function () { App.API('Workspace/Open', 'deviceList') });

}
