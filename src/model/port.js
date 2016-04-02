(function () {

  var port;

  return function (value) {
    if (value) {
      $.log("listening on port", value);
      port = value;
    }
    return port;
  }

})()

