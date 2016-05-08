(function (root) {

  var style = root.nodes['style.styl']
    , css = __.util.insertCss(style())

  style.events.on('changed',
    function () {
      css.parentElement.removeChild(css);
      css = __.util.insertCss(style()); });

})
