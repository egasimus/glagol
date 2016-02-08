;(function(deps, ice){

  var %REQUIRE%;

  var loader = require('glagol')
    , app = window.Glagol = loader(ice);
  Glagol.events = loader.events;
  loader.require.install(deps, require);
  Glagol.noConflict = function noConflict () {
    delete window.Glagol;
    return app;
  }

  app.tree.main();

  var socket = new WebSocket("ws://" + window.location.host);
  socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    switch (data.event) {
      case "glagol.added":   loader(data.path, data.value);        break;
      case "glagol.changed": loader.update(data.path, data.value); break;
      case "glagol.removed": loader.remove(data.path);             break;
    }
  }

})(%DEPS%, %ICE%)
