(function (root, overrides) {

  var reload = window.location.reload.bind(window.location);
  Glagol.events.on('changed', reload);
  root.events.on('changed', reload);

  var App = { root: root };
  overrides = overrides || {};
  ['model', 'socket'].map(install.bind(null, '.js'));
  install('.styl', 'style');
  ['templates', 'events'].map(install.bind(null, ''));
  function install (ext, name) {
    var defaultName = './' + name + ext;
    App[name] = App.root.get(overrides[name] || defaultName);
  }

  console.debug("initializing", App);

  _.tasks.model(App);
  if (App.socket) _.tasks.socket(App);
  if (App.style)  _.tasks.style(App);
  _.tasks.view(App);

  return App;

})
