(function (App) {

  // reload when this file changes
  Glagol.events.once('changed', reload);

  // add http+ws server
  var App = App || {};
  App.Server = App.Server || _.lib.server.server("0.0.0.0", "1617", getURLs);
  App.Server.http.on("listening", listening);
  App.Server.sockets.on("connection", connection);

  console.log($.modules)

  return App;

  function listening  () { $.log("listening on 0.0.0.0:1617"); }
  function connection () { _.onConnection(App, arguments[0]);  }
  function getURLs    () { return _.urls                       }

  function reload (node) {
    if (App.Server) {
      App.Server.http.removeListener("listening", listening);
      App.Server.sockets.removeListener("connection", connection);
    }
    node()(App);
  }

})
