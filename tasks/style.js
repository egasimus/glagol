(function (App) {

  var css = __.util.insertCss(App.style());

  App.style.events.on('changed',
    function () {
      css.parentElement.removeChild(css);
      css = __.util.insertCss(App.style()); });

})
