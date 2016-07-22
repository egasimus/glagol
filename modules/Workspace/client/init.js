(function init (App) {

  App.Workspace =
    { registerFrameType: function (id, cb) {
        _.maps.types.collection.push([ id, cb ])
      }
    , registerMenuItem: function (label, cb) {
        _.views.mainMenu.items.push([ label, cb ]);
      }
  }

  // first request data
  App.API.socket.addEventListener('open',
    function () { App.API('Workspace/Refresh'); })

  // bind keyboard listeners
  window.addEventListener('keydown', function (event) {
    return _.onKey(App.Model(), 'down', event) })
  window.addEventListener('keyup',   function (event) {
    return _.onKey(App.Model(), 'up',   event) })

})
