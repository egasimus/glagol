(function init (App) {

  // connect to server-side persistence backend
  var socket = require('xtend')(
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
          var data = JSON.parse(message.data);
          console.debug("Workspace update", data);
          $.modules.workspace.update(data);
        }
    });

  // expose workspace api
  App.Workspace = require('riko-api2')(socket);

  // bind keyboard listener
  window.addEventListener('keyup',   function (event) { _.onKey('up',   event) });
  window.addEventListener('keydown', function (event) { _.onKey('down', event) });

})
