// wisp translator
var runtime = require('./runtime.js');

// bootstrapper
runtime.requireWisp("./lib/boot-server.wisp", true, true)(module);

// third-party deps
var colors   = require('colors/safe')
  , fs       = require('fs')
  , sendJSON = require('send-data/json')
  , url      = require('url')
  , vm       = require('vm');

// own deps
var Q        = require('q')
  , runtime  = require('./runtime.js')
  , logging  = require('./logging.js')
  , web      = runtime.requireWisp('web');

// state
var log      = logging.getLogger('editor')
  , files    = {}
  , server   = null;

// poehali!
module.exports = {
  start: function start () {
    return Q.all(
      [ startServer()
      , loadFile("sampler-server.wisp").then(executeFile)
      , loadFile("sampler-client.wisp") ]
    ).then(function (args) {
      server = args[0];
      return args[0];
    });
  },
  stop:  function stop () {
    return server.destroy();
  }
}

function loadFile (file) {
  var defer = Q.defer();
  fs.readFile(file, { encoding: 'utf8' },
    function fileLoaded (err, source) {
      if (err) defer.reject(err);
      files[file] =
        { source:   source
        , compiled: runtime.compileSource(source, file) };
      defer.resolve(file);
    });
  return defer.promise;
}

function executeFile (key) {
  process.nextTick(function() {
    vm.runInContext(files[key].compiled.output.code, runtime.makeContext(key));
  })
}

function getMetaForms (file) {
  return files[file].compiled.forms.map(metaForm);
}

function indent (code) {
  return code;
}

function unindent (code) {
  var lines = (code || "").split("\n");
  if (lines.length < 2) return code;
  for (var i = 1; i < lines.length; i++) {
    lines[i] = lines[i].substr(2);
  }
  return lines.join("\n");
}

function metaForm (f) {
  var type, name, body;
  if (f.head.name === 'defn') {
    type = 'fn';
    name = f.tail.head.name;
    body = f.tail.tail.head.metadata.source;
  } else if (f.head.name === 'def') {
    if (f.metadata.source.indexOf('use ') === 0) {
      type = 'use';
      name = f.tail.head.name;
    } else {
      type = 'atom';
      name = f.tail.head.name;
      body = f.tail.tail.head.tail.head.metadata ?
        f.tail.tail.head.tail.head.metadata.source :
        f.tail.tail.head.tail.head
    }
  }
  return { type: type, name: name, body: unindent(body) };
}

function startServer () {
  return web.server(
    { name: "editor"
    , port: 4194     } ,

    web.page(
      '/',      'editor-client.js'),

    web.endpoint(
      '/files', function (req, res) {
        sendJSON(req, res, Object.keys(files)); }),

    web.endpoint(
      '/forms', function (req, res) {
        sendJSON(req, res,
          getMetaForms(url.parse(req.url, true).query.file)); }),

    web.endpoint(
      '/save',  function (req, res) {
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
      '/repl',  function (req, res) {
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
