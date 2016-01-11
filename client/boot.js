;(function(deps, ice){
  var %REQUIRE%;
  require("glagol").require.install(deps, require);
  var app = window._glagol = require("__glagol_thaw")(ice);
  app.tree().main(app);
  var socket = new WebSocket("ws://" + window.location.host)
  socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    if (data.event === "glagol.changed") {
      console.log("changed", data.path);
      app.get(data.path).source = data.value;
    }
  }
})(%DEPS%, %ICE%)
