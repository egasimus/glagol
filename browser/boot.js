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
      data.path.split('/').reduce(installNode, app);
      console.log("%cadded", tag("green"), data.path);
    }

    if (data.event === "glagol.changed") {
      try {
        app.get(data.path).source = data.value;
      } catch (e) {
        data.path.split('/').reduce(installNode, app);
      }
      console.log("%cchanged", tag("orange"), data.path);
    }

    if (data.event === "glagol.removed") {
      try {
        var parent = app.get(data.parent);
      } catch (e) {
        return;
      }
      parent.remove(data.name);
      console.log("%cremoved", tag("darkred"),
        (parent ? parent.path + '/' : '') + data.name);
    }

    function installNode (dir, next, i, steps) {
      if (next === '' && i === 0) {
        return dir;
      }

      if (dir.nodes[next] && glagol.Directory.is(dir.nodes[next])) {
        return dir.nodes[next];
      }

      if (i === steps.length - 1 && data.hasOwnProperty("value")) {
        dir.nodes[next] = glagol.File(next, data.value || "");
      } else {
        dir.nodes[next] = glagol.Directory(next);
      }

      return dir;
    }
  };

  function tag (color) {
    return "background:"+color+";color:white;font-weight:bold;padding:2px 6px"
  }

})(%DEPS%, %ICE%)
