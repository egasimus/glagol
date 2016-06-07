(function (App) {

  // reload when this file changes
  Glagol.events.once('changed', reload);

  //
  var App = App || {};

  // add http+ws server
  App.Server = App.Server || _.lib.server.server("0.0.0.0", "1617", getURLs);
  App.Server.http.on("listening", listening);
  App.Server.sockets.on("connection", connection);

  // add modules
  var modules = Glagol.get('modules')();
  Object.keys(modules).forEach(function (moduleName) {
    $.log('loading module', moduleName, modules[moduleName], modules[moduleName].init);
    if (modules[moduleName].init instanceof Function) {
      modules[moduleName].init();
    }
  })

  return App;

  function listening  () { $.log("listening on 0.0.0.0:1617"); }
  function connection () { _.socket(App, arguments[0]);        }
  function getURLs    () { return _.urls                       }

  function reload (node) {
    if (App.Server) {
      App.Server.http.removeListener("listening", listening);
      App.Server.sockets.removeListener("connection", connection);
    }
    try {
      node()(App);
    } catch (e) {
      $.log('Error reloading /server/main');
      $.log(e);
    }
  }

})
