(function (App) {

  // define globals for template dsl
  if (App.nodes.templates) App.nodes.templates.options.globals =
    function (file) { return {
      emit: function () { return $.util.emit.apply(null, arguments) },
      h:    function () { return $.util.h.apply(null, arguments) } } }

  // start view
  var view = require('riko-mvc').V(App.model, App.nodes.templates().app);
  document.body.innerHTML = "";
  document.body.appendChild(view.target);

  // update view if templates are edited
  App.templates.events.onAny(
    function () { view.update(App.state()()) });

  return view;

})
