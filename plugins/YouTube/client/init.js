module.exports = function () {

  App.Workspace.registerFrameType('youtube',
    function () { return _.views.youtube.apply(null, arguments) });
  App.Workspace.registerMenuItem('YouTube',
    function () { App.API('Workspace/Open', 'youtube') });

}
