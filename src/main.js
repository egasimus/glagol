(function () {

  // refresh whole page if this file changes
  Glagol.nodes['main.js'].events.on('changed',
    function () { window.location.reload() });

  // define globals for template dsl
  Glagol.nodes['templates'].options.globals =
    function (file) { return {
      emit: function () { return $.util.emit.apply(null, arguments) },
      h:    function () { return $.util.h.apply(null, arguments) } } }

  // reconnect if state is re-initialized and connection info is lost
  Glagol.nodes['state.js'].events.once('changed', $.util.connect);

  // init app
  $.util.connect();
  $.util.initStyle();
  $.util.initView();

})
