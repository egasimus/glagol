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

// local services
var log      = logging.getLogger('editor')
  , events   = new (require('eventemitter2').EventEmitter2)();

// state
var ATOMS    = {}
  , SERVER   = null;

// poehali!
module.exports = {
  start: function start () {
    return Q.all(
      [ startServer()
      , loadProject('../gui') ]
    ).then(connectSocket
    ).then(socketConnected );
  },
  stop: function stop () {
    var cleanup = [SERVER.destroy()];
    return Q.all(cleanup);
  }
};

function loadProject (directory) {
  return listAtoms(directory).then(initAtoms).then(readAtoms);
    //concurrently(initAtom)).then(
    //concurrently(readAtom));
}

function initAtoms (atomNames) {
  return Q.allSettled(atomNames.map(function (name) {
    return initAtom(name);
  }));
}

function readAtoms (atoms) {
  return Q.allSettled(atoms.map(function (promised) {
    return readAtom(promised.value)
  }));
}

function listAtoms (directory) {
  return Q.Promise(function (resolve, reject) {
    log("loading atoms from", colors.green(directory));
    glob(path.join(directory, '**', '*'), {}, function (err, atoms) {
      if (err) { log(err); reject(err); }
      var names = atoms.map(path.relative.bind(null, directory)).join(" ");
      log("loaded atoms", colors.bold(names));
      resolve(atoms);
    });
  });
};

function initAtom (name) {
  return Q.Promise(function (resolve) {
    var atom = makeAtom(name);
    ATOMS[name] = atom;
    resolve(atom);
  });
}

function makeAtom (name, source) {
  return {
    name:   name,
    source: observ((source || '').trim()),
    value:  observ(undefined)
  }
}

function readAtom (atom) {
  return Q.Promise(function (resolve, reject) {
    fs.readFile(atom.name, { encoding: 'utf-8' }, function (err, source) {
      if (err) { log(err); reject(err); }
      atom.source.set(source);
      resolve(atom);
    });
  })
};

function freezeAtoms () {
  var snapshot = {};
  Object.keys(ATOMS).map(function (key) {
    snapshot[key] = freezeAtom(ATOMS[key]);
  });
  return snapshot;
}

function freezeAtom (atom) {
  return {
    name:   atom.name,
    source: atom.source(),
    value:  atom.value()
  };
}

function runAtom (name) {
  return Q.Promise(function (resolve, reject) {
    if (Object.keys(ATOMS).indexOf(name) === -1) {
      reject("No atom " + name);
    };
    resolve(evaluateAtom(ATOMS[name]));
  })
}

function evaluateAtom (atom) {
  var compiled = runtime.compileSource(atom.source(), atom.name);
  var context = runtime.makeContext(atom.name);
  var value = vm.runInContext(compiled.output.code, context);
  log(value);
  return value;
}

function connectSocket (args) {
  SERVER       = args[0]
  var project  = args[1]
    , deferred = Q.defer();
  var cache = [];
  SERVER.state.sockets['/socket'].on('connection', function (conn) {
    deferred.resolve(conn, project);
  });
  return deferred.promise;
}

function socketConnected (conn, project) {
  log("connected to client over websocket")
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

    web.socket(),

    web.page(
      '/',       'boot-client.wisp'),

    web.page(
      '/editor', 'client.js'),

    web.endpoint(
      '/atoms',  function (req, res) {
        sendJSON(req, res, freezeAtoms()) }),

    web.endpoint(
      '/run', function (req, res) {
        if (req.method === 'POST') {
          var data = '';
          req.on('data', function (buf) { data += buf });
          req.on('end', function () {
            runAtom(data).then(function (value) {
              sendJSON(req, res, value);
            })
          }); }}),

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
