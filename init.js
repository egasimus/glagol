(function (root, overrides) {

  var reload = window.location.reload.bind(window.location);
  Glagol.events.on('changed', reload);
  root.events.on('changed', reload);

  var App = { root: root };
  overrides = overrides || {};
  ['model', 'socket', 'style'].map(install.bind(null, false));
  ['templates', 'events'].map(install.bind(null, true));
  function install (dir, name) {
    var defaultName = './' + name + (dir ? '' : '.js');
    App[name] = App.root.get(overrides[name] || defaultName);
  }

  _.tasks.model(App);
  if (App.socket) _.tasks.socket(App);
  if (App.style)  _.tasks.style(App);
  _.tasks.view(App);

  return App;

})
