serveGui.tracked = _.gui.tracked;

module.exports = require('riko-route')(
  [ [ /^\/$/,     serveGui ]
  , [ /^\/api.+/, serveApi ] ]);

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

function serveApi (route, req, res) {

  var model = $.modules.Workspace.model.Users.get(id)
    , api   = require('riko-api2')($.api)(model(), socket.send.bind(socket))
    , url   = require('url').parse(req.url)
    , cmd   = url.pathname.split('/').slice(2).reduce(getCommand, api)
    , args  = JSON.parse(decodeURIComponent(require('url').parse(req.url).query));

  console.log('serving api', cmd, args);

  function getCommand (command, fragment) {
    return command[fragment];
  }

}
