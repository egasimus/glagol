(function init (App) {

  var commands =
    { add: function (src) {
        var id     = $.lib.makeId()
          , player = _.player(src);
        player.id = id;
        console.log("add player", id, src, player)
        App.Model.Sound.Players.put(id, player)
      }}

  App.Sound = function () {
    commands[arguments[0]].apply(
      null, Array.prototype.slice.call(arguments, 1)) };

  App.Workspace.registerFrameType('sequencer',
    function () { return _.views.sequencer.apply(null, arguments) });
  App.Workspace.registerMenuItem('Seq&uencer',
    function () { App.API('Workspace/Open', 'sequencer') });

  App.Workspace.registerFrameType('mixer',
    function () { return _.views.mixer.apply(null, arguments) });
  App.Workspace.registerMenuItem('&Mixer',
    function () { App.API('Workspace/Open', 'mixer') });

})
