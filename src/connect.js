(function () {

  // connect to server
  var keepAlive
    , socket = new WebSocket("ws://localhost:1618");
  socket.onclose = function () {
    if (keepAlive) keepAlive = window.clearInterval(keepAlive)
    $.state.server.set(false)
  };
  socket.onopen  = function () {
    keepAlive = window.setInterval(function () { socket.send("ping"); }, 30000)
    $.state.server.set(true)
  };
  $.state.connection.set(require('q-connection')(socket));

  // subscribe to server-side persistence store
  $.util.q.done($.api("subscribe"),
    function (data) {
      var tasks = JSON.parse(data);
      console.log(tasks);
      $.state.put("tasks", tasks);
    },
    $.util.error("could not subscribe to server"));
  //var update = $.emit("update");
  //$.util.q.done($.api("subscribe", update), update,
    //$.util.error("could not subscribe to server"));

  return socket;

})
