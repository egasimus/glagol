(function (model, root, modules) {

  var ready = false;

  var view = require('riko-mvc').V(model, render);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  Object.keys(modules.nodes).forEach(installDir);

  ready = true;
  update();

  return view;

  function installDir (name) {
    try {
      var dir = modules.nodes[name].nodes['views'];
      install(dir);
    } catch (e) {
      console.warn('could not prepare view globals for "' + name + '"',
        'because of', e);
    }
  }

  function install (views) {
    views.options = require('extend')(views.options, {
      globals: function (file) { return {
        emit: function () { return __.util.emit.apply(null, arguments) },
        h:    function () { return __.util.h.apply(null, arguments) } } } })
    views.events.onAny(update); // live reload
    console.info('prepared view globals for', views.name)
  }

  function render (state) {
    console.log('render', ready, state)
    return ready
      ? root().view(state)
      : __.util.h('h1', 'preparing views...');
  }

  function update () {
    view.update(model());
  }

})
