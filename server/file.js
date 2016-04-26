var fs        = require('fs')
  , os        = require('os')
  , path      = require('path')
  , sendData  = require('send-data')
  , sendError = require('send-data/error');

module.exports = function (request, response) {
  var fs = require('fs')
  require('fs').readFile(getPath(request), function (err, data) {
    if (err) {
      sendError(request, response, { body: err })
    } else {
      sendData(request, response, { statusCode: 200, body: data })
    }
  })
};

function getPath (request) {
  var url  = request.url
    , re   = new RegExp('/file/(.+)')
    , file = decodeURI(re.exec(url)[1]);
  if (file.indexOf('~/') === 0) file = path.resolve(os.homedir(), file.slice(2));
  return file;
}
