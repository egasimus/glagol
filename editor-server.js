PORT       = "4194";
FILE       = "sampler-server.wisp";
STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];

var colors   = require('colors/safe')
  , fs       = require('fs')
  , sendJSON = require('send-data/json')
  , vm       = require('vm');

var runtime = require('./runtime.js')
  , logging = require('./logging.js')
  , web     = runtime.requireWisp('web');

var log     = logging.getLogger('editor');

fs.readFile(FILE, { encoding: 'utf8' }, loadMain);

function loadMain (err, source) {

  var compiled = runtime.compileSource(source, FILE)
    , context  = runtime.makeContext('main');
  process.nextTick(function(){
    vm.runInContext(compiled.output.code, context);
  })

  // live editor

  web.server( { name: "editor"
              , port: 4194
              } ,
    web.page(
      '/',      'editor-client.js'),

    web.endpoint(
      '/forms', function (req, res) { sendJSON(req, res, compiled.forms) }),

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
