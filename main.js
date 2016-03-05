(function (root, overrides) {

  var reload = window.location.reload.bind(window.location);
  Glagol.events.on('changed', reload);
  root.events.on('changed', reload);

  var App = { nodes: { root: root } };
  overrides = overrides || {};
  ['model', 'socket', 'style'].map(install.bind(null, false));
  ['templates', 'events'].map(install.bind(null, true));
  function install (dir, name) {
    var defaultName = './' + name + (dir ? '' : '.js');
    App.nodes[name] = root.get(overrides[name] || defaultName);
  }

  _.init.model(App);
  if (App.socket) _.init.socket(App);
  if (App.style)  _.init.style(App);
  _.init.view(App);

  return App;

})
