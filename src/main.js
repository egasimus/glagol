(function () {

  if ($.util.somethingAmiss()) return;

  // refresh whole page if these files change
  Glagol.nodes['options'].nodes['glagol-web-client.js'].on('changed', reload);
  Glagol.nodes['main.js'].events.on('changed', reload);
  function reload () { window.location.reload() }

  // define globals for template dsl
  Glagol.nodes[$.options.glagolWebClient.templateDirectory].options.globals =
    function (file) { return {
      emit: function () { return $.util.emit.apply(null, arguments) },
      h:    function () { return $.util.h.apply(null, arguments) } } }

  // reconnect if state is re-initialized and connection info is lost
  Glagol.nodes[$.options.glagolWebClient.stateFile].events.once('changed',
    $.util.connect);

  // init app
  $.util.connect();
  $.util.initStyle();
  $.util.initView();

})
