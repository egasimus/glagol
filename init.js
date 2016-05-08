(function (root, modules) {

  var reload = window.location.reload.bind(window.location);
  Glagol.events.on('changed', reload);
  root.events.on('changed', reload);

  var App = { Source: root };
  App.Model = _.tasks.model(root, modules);
  App.View  = _.tasks.view(App.Model, root, modules);

  console.debug("initializing", App);

  return App;

})
