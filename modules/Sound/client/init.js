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

  App.Workspace.registerFrameType('sequencer', _.views.sequencer);
  App.Workspace.registerMenuItem('Seq&uencer',
    function () { App.API('Workspace/Open', 'sequencer') });

  App.Workspace.registerFrameType('mixer', _.views.mixer);
  App.Workspace.registerMenuItem('&Mixer',
    function () { App.API('Workspace/Open', 'mixer') });

})
