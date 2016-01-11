;(function(deps, ice){
  var %REQUIRE%;
  require("glagol").require.install(deps, require);
  var app = require("__glagol_thaw")(ice);
  app.tree().main(app);
  var socket = new WebSocket("ws://" + window.location.host)
  socket.onmessage = function (msg) { console.log(arguments) }
})(%DEPS%, %ICE%)
