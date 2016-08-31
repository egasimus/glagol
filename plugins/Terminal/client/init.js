module.exports = function (App) {

  App.Workspace.registerFrameType('terminal',
    function () { return _.views.terminal.apply(null, arguments) });

}
