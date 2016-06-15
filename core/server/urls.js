var route = _.lib.server.route;

module.exports = // TODO convert to riko-route
  [ route('/', serveGui) ]

// helpers

function rel (p) {
  return require('path').resolve.apply(null,
    [__dirname, '..', '..'].concat(p.split('/')));
}

function re (string) {
  return function (request) {
    var input = request.url
      , r     = new RegExp(string);
    $.log('match', input.trim(), 'against', r, r.test(input))
    return r.test(input);
  }
}

function serveGui (req, res) {

  var cookies = require('cookie').parse(req.headers.cookie || '')
    , id      = cookies['user-id'];

  if (!id) {
    id = _.lib.makeId();
    res.setHeader('Set-Cookie', 'user-id=' + id);
    console.log($.modules);
    $.modules.Workspace.model.Users.put(id, { id: id, Frames: [] })
  }

  return _.gui(req, res);

}
