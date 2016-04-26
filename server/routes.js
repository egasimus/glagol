var route = _.lib.server.route
  , app   = _.lib.bundler.app
  , path  = require('path')

var opts = { formats: { '.styl': require('glagol-stylus')() } }

module.exports =
  [ route(
      '/',
      app(opts, path.resolve(__dirname, '../client'))),
  , route(
      re('^/file/(.+)'),
      function (req, res) { return _.file(req, res) }) ];


function re (string) {
  return function (request) {
    var input = request.url
      , r     = new RegExp(string);
    $.log('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}
