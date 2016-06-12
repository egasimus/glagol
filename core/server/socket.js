(function (App, socket) {
  // identify type of socket
  // currently we're serving both client code updates and workspace state,
  // which are mostly unrelated and should be fixed when the general system
  // is ready
  socket.onmessage = function dispatch (msg) {
    switch (msg.data) {

      case "glagol":
        socket.onmessage = null;
        _.lib.bundler.updater.connected(_.urls, socket);
        break;

      case "riko":
        var cookies = socket.upgradeReq.headers.cookie
          , id      = require('cookie').parse(cookies)['user-id'];
        if (!id) {
          $.log("no session id in request cookies");
          return;
        }

        var model = $.modules.workspace.model.Users.get(id);
        if (!model) {
          $.log("can't connect to missing session", id);
          return;
        }

        $.log("opened client connection", id);

        var api = require('riko-api2')($.api)({ socket: socket, state: model() });
        socket.onmessage = function () {
          try {
            api.apply(this, arguments)
          } catch (e) {
            (console.warn || console.log)(e);
          }
        };
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
