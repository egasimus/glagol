var route = _.lib.server.route
  , app   = _.lib.bundler.app
  , path  = require('path')

var opts = { formats: { '.styl': require('glagol-stylus')() } }

module.exports =
  [ route('/',      app(opts, path.resolve(__dirname, '../client'))),
  , route('/file'), function (req, res) { return _.file(req, res) } ];
