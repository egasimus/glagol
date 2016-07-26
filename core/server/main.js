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
  function listening () { $.log("listening on 0.0.0.0:1617") }
  function respond (req, res) { _.urls2(req.url, req, res) }

  // add socket server
  App.Ws = App.Ws || new (require('ws').Server)({ server: App.Http });
  App.Ws.on("connection", connection);
  function connection () { _.socket(App, arguments[0]) }

  // add plugins
  var plugins = Glagol.get('plugins')();
  Object.keys(plugins).forEach(function (pluginName) {
    $.log('loading plugin', pluginName);
    if (plugins[pluginName].init instanceof Function) {
      plugins[pluginName].init();
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
      $.log.error('Error reloading /server/main');
      $.log.error(e);
    }
  }

})
