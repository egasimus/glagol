var route = _.lib.server.route
  , app   = _.lib.bundler.app

// prepare to bundle gui client code to execute in browser
var glagol = require('glagol')
  , opts   = { formats: { '.styl': require('glagol-stylus')() } }
  , gui    = app(opts, rel('core/client'));

// load client modules
gui.tracked.add($.lib.loadModules(rel, 'client'));

// TODO convert to riko-route
module.exports =
  [ route(
      '/',
      function (req, res) {
        var cookies = require('cookie').parse(req.headers.cookie || '')
          , id      = cookies['user-id'];
        if (!id) {
          id = _.lib.makeId();
          res.setHeader('Set-Cookie', 'user-id=' + id);
          _.model.users.put(id, { id: id, frames: [] })
        }
        return gui(req, res);
      }),
  , route(
      re('^/file/(.+)'),
      function (req, res) { return _.file(req, res) }) ];

// helpers

function re (string) {
  return function (request) {
    var input = request.url
      , r     = new RegExp(string);
    $.log('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

function rel (p) {
  return require('path').resolve.apply(null,
    [__dirname, '..', '..'].concat(p.split('/')));
}
