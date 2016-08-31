module.exports = function (App) {

  App.Workspace.registerFrameType('deviceList',
    function () { return _.views.list.apply(null, arguments) });
  App.Workspace.registerFrameType('deviceDetail',
    function () { return _.views.detail.apply(null, arguments) });

}
