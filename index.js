STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];
var ast      = require('../wisp/ast.js')
  , sequence = require('../wisp/sequence.js');
function processForms (read, source) {

  if (read.error) throw new Error("Reader error: " + read.error);

  var lines  = source.split("\n")
    , forms  = read.forms
    , output = []
    , error  = []
    , state  = STATE_INIT
    , arg    = null
    , meta   = null;

  function isSymbol(f) {
    return f.metadata.type === 'wisp.symbol' && f.namespace === undefined;
  }

  function exitState(f) {
    if (meta) val = ast.withMeta(f, meta);
    Object.defineProperty(f, 'metadata', { enumerable: true });
    output.push(f);
    state = STATE_INIT;
    arg   = null;
    meta  = null;
  }

  function unexpectedForm(f, i) {
    throw new Error('Unexpected form ' + i + ': ' + f +
      (f.metadata ? (' at ' + f.metadata.start.line
                      + ':' + f.metadata.start.column)
                  : ''));
  }

  function getSource(f) {
    var src  = []
      , meta = f.metadata;
    for (var l = meta.start.line; l <= meta.end.line; l++) {
      src.push(
        l === meta.start.line ? lines[l].substr(meta.start.column)  :
        l === meta.end.line   ? lines[l].substr(0, meta.end.column) :
        lines[l]
      );
    }
    return src.join("\n");
  }

  function arrayToObject(arr) {
    var obj = { metadata: arr.metadata };
    for (var i = 0; i < arr.length; i++) {
      obj[i] = arr[i];
    }
    return obj
  }

  function exposeMetadata(f) {
    if (f instanceof Array) f = arrayToObject(f);
    Object.defineProperty(f, 'metadata', { enumerable: true });
    f.metadata.type   = f.constructor.type;
    f.metadata.source = getSource(f);
    return f;
  }

  var sym  = ast.symbol.bind(null, undefined)
    , list = sequence.list;

  for (var i = 0; i < forms.length; i++) {
    var form = forms[i]
      , type = form.constructor.type;

    form = exposeMetadata(form);

    if (state === STATE_INIT) {

      if (isSymbol(form) && form.name === 'use') {
        state = STATE_USE;
        meta  = form.metadata;
      } else if (isSymbol(form) && form.name === 'fn') {
        state = STATE_FN;
        meta  = form.metadata;
      } else if (isSymbol(form)) {
        state = STATE_DEF;
        meta  = form.metadata;
        arg   = form;
      } else unexpectedForm(form, i);

    } else {

      if (isSymbol(form) && KEYWORDS.indexOf(form.name) != -1) {
        unexpectedForm(form, i);
      }
      if (state === STATE_USE) {
        exitState(sequence.list(
          ast.symbol(undefined, 'use'),
          form.name));
      } else if (state === STATE_FN) {
        if (arg === null) arg = form;
        else exitState(sequence.list(
          ast.symbol(undefined, 'defn'),
          arg, form));
      } else if (state === STATE_DEF) {
        exitState(sequence.list(
          ast.symbol(undefined, 'def'),
          arg, form));
      }

    }

  }

  return output;

}


var path = require('path');
function findModule(name) {
  return path.resolve(path.join('.', 'lib', name + '.wisp'));
}


function useModule (context, name) {
  console.log("Loading", findModule(name));
  context[name] = require(findModule(name));
}


var wisp       = require("../wisp/compiler.js")
  , http       = require("http")
  , sendHTML   = require("send-data/html")
  , sendJSON   = require("send-data/json")
  , browserify = require("browserify")
  , vm         = require("vm");
  //, vm2        = require("vm2");
function loadFile (err, source) {

  // wisp ast
  var forms = processForms(wisp.readForms(source, 'main.wisp'), source);

  // js ast
  var processed = wisp.analyzeForms(forms);

  // js code
  var options =
    { 'source-uri': 'main.wisp'
    , 'source':     source };
  var output = wisp.generate.bind(null, options).apply(null, processed.ast);

  // repl
  var context = { exports: {} };
  context.use = useModule.bind(null, context);
  Object.keys(ast).map(function(k) { context[k] = ast[k] });
  vm.createContext(context);
  //vm.runInContext(output.code, context);

  // live editor
  options =
    { debug: false
    , extensions: ['.wisp'] };
  var bundled = null;
  browserify(options)
    .transform('stylify')
    .add('editor.js')
    .bundle(function (error, output) {
      if (error) throw error;
      bundled = output;
    });

  http.createServer(function (req, res) {
    if (req.url === '/') {
      sendHTML(req, res, { body: '<body><script>' + bundled + '</script>' });
    } else if (req.url === '/forms') {
      sendJSON(req, res, forms);
    }
  }).listen("4194");
  // ugh

}


var fs = require('fs');
fs.readFile('main.wisp', { encoding: 'utf8' }, loadFile);
