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

  function exitState(f, meta) {
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

  function exposeMetadata(f) {
    Object.defineProperty(f, 'metadata', { enumerable: true });
    f.metadata.type   = f.constructor.type;
    f.metadata.source = getSource(f);
    return f;
  }

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
          form), meta);
      } else if (state === STATE_FN) {
        if (arg === null) arg = form;
        else exitState(sequence.list(
          ast.symbol(undefined, 'defn'),
          arg, form), meta);
      } else if (state === STATE_DEF) {
        exitState(sequence.list(
          ast.symbol(undefined, 'def'),
          arg, form), meta);
      }

    }

  }

  return output;

}


var wisp       = require("../wisp/compiler.js")
  , http       = require("http")
  , sendHTML   = require("send-data/html")
  , sendJSON   = require("send-data/json")
  , browserify = require("browserify");
function loadFile (err, source) {

  // wisp ast
  var forms = processForms(wisp.readForms(source, 'main.wisp'), source);

  // js ast
  var ast = wisp.analyzeForms(forms);

  // js code
  var options =
    { 'source-uri': 'main.wisp'
    , 'source':     source };
  var output = wisp.generate.bind(null, options).apply(null, ast.ast);

  // live editor
  options =
    { debug: false
    , extensions: ['.wisp'] };
  browserify(options)
    .transform('stylify')
    .add('editor.js')
    .bundle(function (error, bundled) {
        if (error) throw error;
        http.createServer(function (req, res) {
          if (req.url === '/') {
            sendHTML(req, res, { body: '<body><script>' + bundled + '</script>' });
          } else if (req.url === '/forms') {
            
            forms.map(function(f){console.log('>', f.tail.tail)});
            sendJSON(req, res, forms);
          }
        }).listen("4194");
    });
  // ugh

}


var fs = require('fs');
fs.readFile('main.wisp', { encoding: 'utf8' }, loadFile);
