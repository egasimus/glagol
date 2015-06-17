// third-party deps
var colors   = require('colors/safe')
  , fs       = require('fs')
  , sendJSON = require('send-data/json')
  , vm       = require('vm');

// own deps
var Q        = require('q')
  , runtime  = require('./runtime.js')
  , logging  = require('./logging.js')
  , web      = runtime.requireWisp('web');

// state
var log      = logging.getLogger('editor')
  , files    = {};

// poehali!
startServer();
loadFile("sampler-server.wisp").then(executeFile);
loadFile("sampler-client.wisp");

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
  process.nextTick(function(){
    vm.runInContext(files[key].compiled.code, runtime.makeContext(key));
  })
}

function startServer () {
  web.server( { name: "editor"
              , port: 4194
              } ,
    web.page(
      '/',      'editor-client.js'),

    web.endpoint(
      '/files', function (req, res) {
        sendJSON(req, res, Object.keys(files));
      }),

    web.endpoint(
      '/forms', function (req, res) {
        sendJSON(req, res, compiled.forms)
      }),

    web.endpoint(
      '/save',  function (req, res) {
        if (req.method === 'POST') {
          req.on('end', function () {
            sendJSON(req, res, "OK");
          });
        }}),

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
              sendJSON(req, res, JSON.stringify(e));
            }
          });
        }}));
}
