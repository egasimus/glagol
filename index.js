STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];
var ast      = require('../wisp/ast.js')
  , sequence = require('../wisp/sequence.js');
function processForms (read) {

  if (read.error) throw new Error("Reader error: " + read.error);

  var forms  = read.forms
    , output = []
    , error  = []
    , state  = STATE_INIT
    , arg    = null
    , meta   = null;

  function isSymbol(f) {
    return f.metadata.type === 'wisp.symbol' && f.namespace === undefined;
  }

  function exitState(val, meta) {
    if (meta) val = ast.withMeta(val, meta);
    output.push(val);
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

  function enableMetadata(f) {
    Object.defineProperty(f, 'metadata', { enumerable: true });
    f.metadata.type = f.constructor.type
    return f;
  }

  for (var i = 0; i < forms.length; i++) {
    var form = forms[i]
      , type = form.constructor.type;

    form = enableMetadata(form);

    console.log("->", form);

    if (state === STATE_INIT) {
      console.log('init', form, isSymbol(form));

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


function makePage(forms) {
  return '' + 
    '<head><style>* { font-family: sans-serif; color: #555; }</style></head>' +
    '<body><script>var forms = ' + JSON.stringify(forms) + '</script>' + 
    '<script>forms.map(function(f){ ' +
    'var el = document.createElement("div"); console.log(JSON.serialize(f));' +
    ' el.innerHTML = f; document.body.appendChild(el)})</script></body>';
}


var wisp     = require("../wisp/compiler.js")
  , http     = require("http")
  , sendHTML = require("send-data/html");
function loadFile (err, data) {

  // wisp ast
  var forms = processForms(wisp.readForms(data, 'main.wisp'))

  // js ast
  var ast = wisp.analyzeForms(forms);
  console.log("\n", ast);

  // js code
  var options = { "source-uri": "foobar", "source": data };
  var output = wisp.generate.bind(null, options).apply(null, ast.ast);
  console.log("\n", output);

  // live editor
  http.createServer(function (req, res) {
    sendHTML(req, res, { body: makePage(forms) });
  }).listen("4194");

}


var fs = require('fs');
fs.readFile('main.wisp', { encoding: 'utf8' }, loadFile);
