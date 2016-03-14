(function (App, settings) {

  // define globals for template dsl
  App.templates.options = require('extend')(App.templates.options, {
    globals: function (file) { return {
      emit: function () { return __.util.emit.apply(null, arguments) },
      h:    function () { return __.util.h.apply(null, arguments) } } } });

  // start view
  var view = require('riko-mvc').V(App.model,
    function (state) { return App.templates().app(state) });
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  // update view if templates are edited
  App.templates.events.onAny(function () { view.update(App.model()) });

  return view;

})
