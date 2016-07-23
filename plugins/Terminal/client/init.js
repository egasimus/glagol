module.exports = function (App) {

  App.Workspace.registerFrameType('terminal',
    function () { return _.views.terminal.apply(null, arguments) });
  App.Workspace.registerMenuItem('&Terminal',
    function () { App.API('Workspace/Open', 'terminal') });

}
