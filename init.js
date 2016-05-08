(function (entryPoint, modules) {

  // TODO special case single-file apps
  var root = entryPoint.parent;
  modules = modules || root.get('modules');

  // do a full page reload:
  // * when entry point changes
  // * when anything in this lib changes
  var reload = window.location.reload.bind(window.location);
  entryPoint.events.on('changed', reload);
  Glagol.parent.events.on('changed', reload);

  // create the app state singleton
  var App = {}
  App.Root  = root;
  App.Main  = entryPoint;
  App.Model = _.tasks.model(root, modules);
  App.Style = _.tasks.style(root);
  App.View  = _.tasks.view(App.Model, root, modules);

  // and we're done
  console.debug("initialized", App);
  return App;

})
