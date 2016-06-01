(function (socket) {
  // identify type of socket
  // currently we're serving both client code updates and workspace state,
  // which are mostly unrelated and should be fixed when the general system
  // is ready
  socket.onmessage = function dispatch (msg) {
    switch (msg.data) {
      case "glagol":
        socket.onmessage = null;
        _.lib.bundler.updater.connected(_.routes, socket);
        break;
      case "riko":
        var state = { id: _.lib.makeId(), socket: socket, frames: [] }
        $.log("opened client connection", state.id);
        _.model.users.put(state.id, state);
        socket.onmessage = require('riko-api2')($.api)(state);
        socket.onclose = function () {
          $.log('closed client connection', state.id);
          _.model.users.delete(state.id);
        }
        break;
      default:
        $.log("unidentified flying message:", msg.data);
    }
  }
})
