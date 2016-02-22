(function () {

  // react to file changes
  Glagol.nodes['main.js'].events.on('changed',
    function () { window.location.reload() });
  Glagol.nodes['state.js'].events.on('changed',
    function () { $.connect() });
  Glagol.nodes['templates'].events.onAny(
    function () { view.update($.state()) });

  // define globals for template dsl
  Glagol.nodes['templates'].options.globals = function (file) {
    return {
      emit: function () { return $.util.emit.apply(null, arguments) },
      h:    function () { return $.util.h.apply(null, arguments) } } }

  // init app
  $.connect(); // connect to server
  var css = $.util.insertCss($.style); // css first so no fouc
  var view = require('riko-mvc').V($.state, $.templates.app); // start main loop
  document.body.innerHTML = "";
  document.body.appendChild(view.target);
  return view;

})
