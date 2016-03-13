;(function(deps, ice){

  var %REQUIRE%;

  var glagol = require('glagol')
    , app = window.Glagol = glagol(ice, { formats: %FORMATS% });
  glagol.require.install(deps, require);
  window.Glagol.noConflict = function noConflict () {
    delete window.Glagol;
    return app;
  }

  app().main();

  var socket = new WebSocket("ws://" + window.location.host);
  socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    console.log("->",data)
    switch (data.event) {
      case "glagol.added":
        glagol.defaultLoader.add(data.path, data.value);
        break;
      case "glagol.changed":
        glagol.defaultLoader.update(data.path, data.value);
        break;
      case "glagol.removed":
        glagol.defaultLoader.remove(data.path);
        break;
    }
  }

})(
%DEPS%,
%ICE%
)
