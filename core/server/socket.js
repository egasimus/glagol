(function (App, socket) {

  socket.onmessage = function dispatch (msg) {
    // identify type of connection needed (workspace api vs client code updates)
    switch (msg.data) {

      case "glagol":
        socket.onmessage = null;
        // TODO decouple updater
        _.lib.bundler.updater.connected(_.urls, socket);
        break;

      case "api":
        socket.onmessage = null;
        var cookies = socket.upgradeReq.headers.cookie
          , id      = require('cookie').parse(cookies)['user-id'];
        if (!id) {
          $.log("no session id in request cookies");
          return;
        }

        var model = $.modules.Workspace.model.Users.get(id);
        if (!model) {
          $.log("can't connect to missing session", id);
          return;
        }

        $.log("opened client connection", id);

        var api = require('riko-api2')($.api)(model(), socket.send.bind(socket));
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
