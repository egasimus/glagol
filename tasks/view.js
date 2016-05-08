(function (model, root, modules) {

  var ready = false;

  var view = require('riko-mvc/view')(model, render);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  [root].concat(modules).forEach(install);

  ready = true;


  return view;

  function install (module) {
    try {
      var views = module.nodes['templates'];
      views.options = require('extend')(views.options, {
        globals: function (file) { return {
          emit: function () { return __.util.emit.apply(null, arguments) },
          h:    function () { return __.util.h.apply(null, arguments) } } } })
      views.events.onAny(update); // live reload
      console.info('prepared view globals for', module.name)
    } catch (e) {
      console.warn('could not prepare view globals for', module.name,
        'because of', e);
    }
  }

  function render (state) {
    console.log('render', ready, state)
    return ready
      ? App.templates().app(state)
      : __.util.h('h1', 'preparing views...');
  }

  function update () {
    view.update(App.model());
  }

})
