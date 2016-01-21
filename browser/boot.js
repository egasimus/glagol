;(function(deps, ice){
  var %REQUIRE%;
  var glagol = require('glagol');
  glagol.require.install(deps, require);
  var app = window._glagol = require("__glagol-thaw__")(ice);
  app.tree.main(app);
  var socket = new WebSocket("ws://" + window.location.host);
  socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    if (data.event === "glagol.added") {
      data.path.split('/').reduce(function (dir, next, i, steps) {
        if (next === '' && i === 0) return dir;
        if (dir.nodes[next] && glagol.Directory.is(dir.nodes[next])) return dir.nodes[next];
        if (i === steps.length - 1) dir.nodes[next] = glagol.File(next, data.source);
        dir.nodes[next] = glagol.Directory(next);
        return dir;
      }, app);
      console.log("added", data.path);
    }
    if (data.event === "glagol.changed") {
      app.get(data.path).source = data.value;
      console.log("changed", data.path);
    }
    if (data.event === "glagol.removed") {
      app.get(data.parent).remove(data.name);
      console.log("removed", data.name, "from", data.parent);
    }
  };
})(%DEPS%, %ICE%)
