(function () {

  var css = $.util.insertCss($.style);

  Glagol.nodes['style.styl'].events.on('changed',
    function () {
      css.parentElement.removeChild(css);
      css = $.util.insertCss($.style); });

})
