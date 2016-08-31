module.exports = function () {

  App.Workspace.registerFrameType('youtube',
    function () { return _.views.youtube.apply(null, arguments) });

}
