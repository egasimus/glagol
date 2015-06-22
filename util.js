var http = require('http')
  , Q    = require('q')


var handleStreamingResponse = module.exports.handleStreamingResponse =
function handleStreamingResponse (cb) {
  return function (res) {
    var data = '';
    res.on('data', function (buf) { data += buf; });
    res.on('end',  function ()    { cb(data);    });
  }
}


var post = module.exports.post = function post (url, data) {
  var deferred = Q.defer();
  var req = http.request(
    { method: 'POST'
    , path:   url },
    handleStreamingResponse(function (data) {
      deferred.resolve(data);
    }));
  req.end(data || "");
  return deferred.promise;
}


var concurrently = module.exports.concurrently = function concurrently (cb) {
  return function runConcurrently (args) {
    return Q.allSettled(args.map(cb));
  }
}
