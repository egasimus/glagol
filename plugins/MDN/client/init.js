module.exports = function (App) {
  App.Workspace.registerFrameType('mdn',
    function () { return _.views.mdn.apply(null, arguments) });
}
