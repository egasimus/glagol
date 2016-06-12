(function init (App) {

  // connect to server-side persistence backend
  var socket = require('extend')(
    new WebSocket('ws://localhost:1617'),
    { onopen:
        function () {
          socket.onopen = null;
          socket.send('riko');
          App.Workspace('refresh');
        }
    , onclose:
        function () {
          window.location.reload();
        }
    , onmessage:
        function (message) {
          $.modules.workspace.update(JSON.parse(message.data));
        }
    });

  // expose workspace api
  App.Workspace = require('riko-api2')(socket);

  // bind keyboard listeners
  ['up', 'down'].forEach(function (direction) {
    window.addEventListener('key' + direction, function (event) {
      return _.onKey(App.Model(), direction, event); }) })

})
