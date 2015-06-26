// wisp translator
var runtime = require('./runtime.js');

// bootstrapper
runtime.requireWisp("./boot-server.wisp", true, true)(module);

// third-party deps
var colors   = require('colors/safe')
  , fs       = require('fs')
  , glob     = require('glob')
  , observ   = require('observ')
  , path     = require('path')
  , sendJSON = require('send-data/json')
  , url      = require('url')
  , vm       = require('vm');

// own deps
var Q        = require('q')
  , runtime  = require('./runtime.js')
  , logging  = require('./logging.js')
  , web      = runtime.requireWisp('web');

// local state
var log      = logging.getLogger('editor')
  , files    = {}
  , ATOMS    = {}
  , server   = null;

// poehali!
module.exports = {
  start: function start () {
    return Q.all(
      [ startServer()
      , loadProject('../gui') ]
    ).then(function (args) {
      server = args[0];
      return args[0];
    });
  },
  stop: function stop () {
    var cleanup = [];
    Object.keys(files).map(function(i) {
      var context = files[i].context;
      if (context) Object.keys(context).map(function(j) {
        var instance = context[j];
        if (context[j].type === "Atom") {
          cleanup.push(instance.destroy());
        }
      });
    });
    cleanup.push(server.destroy());
    return Q.all(cleanup);
  }
};

function loadProject (directory) {
  return listAtoms(directory).then(concurrently(readAtom));
}

function listAtoms (directory) {
  return Q.Promise(function (resolve, reject, notify) {
    log("loading atoms from", colors.green(directory));
    glob(path.join(directory, '**', '*'), {}, function (err, atoms) {
      if (err) reject(err);
      log("loaded atoms", colors.bold(
        atoms.map(path.relative.bind(null, directory)).join(" ")));
      atoms.map(function (atom) { ATOMS[atom] = makeAtom(atom); });
      resolve(atoms);
    });
  });
};

function makeAtom (atom) {
  return {
    name:   atom,
    source: '',
    value:  observ()
  }
}

function readAtom (atom) {
  return Q.Promise(function (resolve, reject, notify) {
    var deferred = Q.defer();
    atoms[atom] = deferred.promise;
    fs.readFile(atom, { encoding: 'utf-8' }, function (err, data) {
      if (err) reject(err);
      log(atom, data);
      ATOMS[atom].set(data);
      resolve(atom, data);
    });
  });
};

function concurrently (cb) {
  return function runConcurrently (args) {
    return Q.allSettled(args.map(cb));
  }
};

function startServer () {
  return web.server(
    { name: "editor"
    , port: 4194     } ,

    web.page(
      '/',       'boot-client.wisp'),

    web.page(
      '/editor', 'client.js'),

    web.endpoint(
      '/atoms',  function (req, res) {
        sendJSON(req, res, ATOMS); }),

    web.endpoint(
      '/update', function (req, res) {
        if (req.method === 'POST') {
          var data = '';
          req.on('data', function (buf) { data += buf });
          req.on('end', function () {
            var file = url.parse(req.url, true).query.file;
            executeForm(file, JSON.parse(data));
            sendJSON(req, res, "OK");
          }); }}),

    web.endpoint(
      '/save',   function (req, res) {
        if (req.method === 'POST') {
          var data = '';
          req.on('data', function (buf) { data += buf });
          req.on('end', function () {
            fs.writeFile(url.parse(req.url, true).query.file, indent(data),
              function (err) {
                if (err) throw err;
                sendJSON(req, res, "OK");
              }); }); }; }),

    web.endpoint(
      '/repl',   function (req, res) {
        if (req.method === 'POST') {
          var data = '';
          req.on('data', function (buf) { data += buf });
          req.on('end', function () {
            log("executing", data);
            try {
              var result = vm.runInContext(runtime.compileSource(data, 'repl').output.code, context);
              sendJSON(req, res, JSON.stringify(result || null));
            } catch (e) {
              log(colors.red('error'), e);
              sendJSON(req, res, JSON.stringify(e)); } }); }; }));
}
