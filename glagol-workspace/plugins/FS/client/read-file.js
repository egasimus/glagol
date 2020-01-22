(function (src, cb) {

  var url = '/api/FS/ReadFile?' + JSON.stringify([src]);

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {
    cb(null, request.response);
  };
  request.onerror = function () {
    cb(Error('could not load ' + src), null);
  };
  request.send();

})
