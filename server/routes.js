var route = _.lib.server.route
  , app   = _.lib.bundler.app
  , path  = require('path')

module.exports =
  [ route("/", app({}, path.resolve(__dirname, '../client'))) ];
