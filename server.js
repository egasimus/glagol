var runtime = require('./runtime.js');
runtime.requireWisp("./boot-server.wisp", true, true)(module);

var colors   = require('colors/safe')
  , engine   = runtime.requireWisp('./engine.wisp')
  , sendJSON = require('send-data/json')
  , logging  = require('./logging.js')
  , Q        = require('q')
  , web      = runtime.requireWisp('./lib/web.wisp');

var log      = logging.getLogger('editor')
var SERVER   = { destroy: function () { log("server not loaded, can't destroy") } };

//start().done();

var start = module.exports.start = function start () {
  return Q.when(startServer())
    .then(function (server) { SERVER = server; return server })
    .then(connectSocket)
    .then(socketConnected)
    .then(engine.start.bind(null, './project'))
}

var stop = module.exports.stop = function stop () {
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
    socket.send(JSON.stringify(
      { event: 'atom-updated'
      , data:  logging.filterObject(atom) }));
  });
  log("connected to client over websocket");
};

function logError (e) {
  log(colors.red(
    'error' +
    (e.file ? (' in ' + colors.bold(e.file)) : '') +
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
            data = JSON.parse(data);
            var send = sendJSON.bind(null, req, res)
            if (!data.id) {
              var msg = "No atom specified."
              logError({ message: msg });
              send({ error: true, message: msg });
            } else if (Object.keys(engine.ATOMS).indexOf(data.id) === -1) {
              var msg = "No atom " + data.id;
              logError({ message: msg });
              send({ error: true, message: msg });

            } else {
              var atom = engine.ATOMS[data.id];
              if (data.source) atom.source.set(data.source);
              engine.evaluateAtom(atom).then(function (atom) {
                send(logging.filterObject(engine.freezeAtom(atom)));
              }).catch(function (e) {
                e.file = data.id;
                logError(e);
                send(
                  { error:     true
                  , timestamp: Math.floor(Date.now())
                  , message:   e.message
                  , line:      e.lineNumber
                  , file:      data.id
                  , stack:     e.stack });
              }).done();
            }
          }); }}))};
