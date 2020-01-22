;(function(deps, ice){

  // if running in electron, we wanna keep this around to use elektron's modules
  if (window.require) window.nativeRequire = window.require;

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
  socket.onopen = function () { socket.send('glagol'); }
  socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
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
