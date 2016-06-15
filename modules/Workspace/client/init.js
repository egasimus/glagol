(function init (App) {

  var socket = App.API.socket;
  socket.addEventListener('open',
    function () { App.API('Workspace/Refresh'); })

  // bind keyboard listeners
  ['up', 'down'].forEach(function (direction) {
    window.addEventListener('key' + direction, function (event) {
      console.log(event)
      return _.onKey(App.Model(), direction, event); }) })

})
