(function (App) {

  // reload when this file changes
  Glagol.events.once('changed', reload);

  // this tries to persist across reloads
  var App = App || {};

  // add http server
  App.Http = App.Http || new (require('http').Server)();
  App.Http.on("listening", listening);
  App.Http.on("request", respond);
  App.Http.listen(1617);
  function listening () { $.log("listening on 0.0.0.0:1617"); }
  function respond (req, res) { $.log(_.urls2(req.url)) }

  // add socket server
  App.Ws = App.Ws || new (require('ws').Server)({ server: App.Http });
  App.Ws.on("connection", connection);
  function connection () { _.socket(App, arguments[0]); }

  // add modules
  var modules = Glagol.get('modules')();
  Object.keys(modules).forEach(function (moduleName) {
    $.log('loading module', moduleName);
    if (modules[moduleName].init instanceof Function) {
      modules[moduleName].init();
    }
  })

  return App;

  function reload (node) {
    $.log('Restarting server...');
    if (App.Http) {
      App.Http.removeListener('listening', listening);
      App.Http.removeListener('request',   respond);
    }
    if (App.Socket) {
      App.Socket.removeListener('connection', connection);
    }
    try {
      node()(App);
    } catch (e) {
      $.log('Error reloading /server/main');
      $.log(e);
    }
  }

})
