(function () {

  var css = $.util.insertCss($.style);

  Glagol.nodes[$.options.glagolWebClient.styleFile].events.on('changed',
    function () {
      css.parentElement.removeChild(css);
      css = $.util.insertCss($.style); });

})
