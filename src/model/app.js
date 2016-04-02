(function () {

  var app;

  return function (path) {
    if (path) {
      $.log("loading", path);
      app = require(path);
      app().main();
      $.log("loaded app from", path);
    }
    return app;
  }

})()
