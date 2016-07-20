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

  __.Workspace.maps.types.collection.push(
    [ 'sequencer', _.views.sequencer ])

  __.Workspace.maps.types.collection.push(
    [ 'mixer', _.views.mixer ])

})
