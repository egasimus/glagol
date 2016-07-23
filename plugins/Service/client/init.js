module.exports = function (App) {

  App.Workspace.registerFrameType('serviceList',   _.views.list);
  App.Workspace.registerFrameType('serviceDetail', _.views.detail);

  App.Workspace.registerMenuItem('Service list',
    function () { App.API('Workspace/Open', 'serviceList') });

}
