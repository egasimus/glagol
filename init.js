(function (root, modules) {

  var reload = window.location.reload.bind(window.location);
  Glagol.events.on('changed', reload);
  root.events.on('changed', reload);

  var App = {}
  App.Source = root;
  App.Model  = _.tasks.model(root, modules);
  App.Style  = _.tasks.style(root);
  App.View   = _.tasks.view(App.Model, root, modules);

  console.debug("initialized", App);

  return App;

})
