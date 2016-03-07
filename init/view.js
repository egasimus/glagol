(function (App) {

  var templates = App.nodes['templates'];

  // define globals for template dsl
  templates.options = require('extend')(templates.options, {
    globals: function (file) { return {
      emit: function () { return __.util.emit.apply(null, arguments) },
      h:    function () { return __.util.h.apply(null, arguments) } } } });

  // start view
  var view = require('riko-mvc').V(App.model, templates().app);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  // update view if templates are edited
  templates.events.onAny(function () { view.update(App.state()()) });

  return view;

})
