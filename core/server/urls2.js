module.exports = require('riko-route')(
  [ [ '/', serveGui ] ]);

function serveGui (route, req, res) {

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
