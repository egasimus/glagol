module.exports =
  { start: start
  , stop:  stop  };

var runtime = require('./runtime.js');

//runtime.requireWisp("./boot-server.wisp", true, true)(module);

var colors   = require('colors/safe')
  //, engine   = require('./engine.js')
  , engine   = runtime.requireWisp('./engine.wisp')
  , sendJSON = require('send-data/json')
  , logging  = require('./logging.js')
  , Q        = require('q')
  , web      = runtime.requireWisp('./lib/web.wisp');

var log      = logging.getLogger('editor')
var SERVER   = { destroy: function () { log("server not loaded, can't destroy") } };

start();

function start () {
  return Q.all(
    [ startServer()
    , engine.loadDirectory('../gui') ]
  ).spread(function (server, atoms) {
    SERVER = server;
    Q.when(atoms)
     .done();
    Q.when(server)
     .then(connectSocket)
     .then(socketConnected)
     .done();
  })
}

function stop () {
  var cleanup = [SERVER.destroy()];
  return Q.all(cleanup);
}

function connectSocket (server) {
  return Q.Promise(function (resolve) {
    server.state.sockets['/socket'].on('connection', resolve);
  })
}

function socketConnected (socket) {
  //engine.events.on()
  engine.events.on('atom-updated', function (atom) {
    socket.send(JSON.stringify({ event: 'atom-updated', data: atom }));
  });
  log("connected to client over websocket");
};

function logError (e) {
  log(colors.red(
    'error in ' + colors.bold(data) +
    (e.lineNumber ? (' at ' + colors.bold(e.lineNumber || '??')) : '') +
    ':'), colors.bold(e.message));
  log(e.stack);
}

function startServer () {
  return web.server(
    { name: "editor"
    , port: 4194     } ,

    web.socket(),

    web.page(
      '/',       'boot-client.wisp'),

    web.page(
      '/editor', 'client.js'),

    web.endpoint(
      '/atoms',  function (req, res) {
        var atoms = engine.freezeAtoms();
        sendJSON(req, res, logging.filterObject(atoms)) }),

    web.endpoint(
      '/run', function (req, res) {
        if (req.method === 'POST') {
          var data = '';
          req.on('data', function (buf) { data += buf });
          req.on('end', function () {
            engine.runAtom(data).then(function (atom) {
              sendJSON(req, res, logging.filterObject(engine.freezeAtom(atom)));
            }).catch(function (e) {
              logError(e);
              sendJSON(req, res,
                { error:   true
                , message: e.message
                , line:    e.lineNumber
                , file:    data 
                , stack:   e.stack});
            })
          }); }}))};
