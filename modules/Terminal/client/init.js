module.exports = function (App) {

  App.Workspace.registerFrameType('terminal', _.views.terminal);
  App.Workspace.registerMenuItem('&Terminal',
    function () { App.API('Workspace/Open', 'terminal') });

}
