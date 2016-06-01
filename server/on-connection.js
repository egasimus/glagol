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
        var cookies = socket.upgradeReq.headers.cookie
          , id      = require('cookie').parse(cookies)['user-id'];
        if (!id) {
          $.log("no session id in request cookies");
          return;
        }

        var model = _.model.users.get(id);
        if (!model) {
          $.log("can't connect to missing session", id);
          return;
        }

        $.log("opened client connection", id);
        model.put('socket', socket);

        socket.onmessage = require('riko-api2')($.api)(model());
        socket.onclose = function () {
          $.log('closed client connection', id);
          //_.model.users.delete(id);
        }
        break;

      default:
        $.log("unidentified flying message:", msg.data);
    }
  }
})
