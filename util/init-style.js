(function (App) {

  var css = $.util.insertCss(App.style());

  App.style.events.on('changed',
    function () {
      css.parentElement.removeChild(css);
      css = $.util.insertCss(App.style()); });

})
