serveGui.tracked = _.gui.tracked;

module.exports = require('riko-route')(
  [ [ /^\/$/,     serveGui ]
  , [ /^\/api.+/, serveApi ] ]);

function serveGui (route, req, res) {

  var id = authenticate(req);

  if (!id) {
    id = _.lib.makeId();
    res.setHeader('Set-Cookie', 'user-id=' + id);
    console.log($.modules);
    $.modules.Workspace.model.Users.put(id, { id: id, Frames: [] })
  }

  return _.gui(req, res);

}

function serveApi (route, req, res) {

  var id    = authenticate(req)
    , model = $.modules.Workspace.model.Users.get(id) || (function(){})
    , api   = $.api(model(), respond)
    , url   = require('url').parse(req.url)
    , cmd   = url.pathname.split('/').slice(2).join('/')
    , args  = JSON.parse(decodeURIComponent(require('url').parse(req.url).query));

  api[cmd].apply(null, args);

  function respond (data) {
    require('send-data')(req, res, { body: data });
  }

}

function authenticate (req) {
  var cookies = require('cookie').parse(req.headers.cookie || '')
  return cookies['user-id'];
}
