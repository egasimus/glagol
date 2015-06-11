SESSION_BEFORE = ""// ["(session", "", ""].join("\n");
SESSION_AFTER  = ""//")"
function preprocess (data) {
  return SESSION_BEFORE + data + SESSION_AFTER;
}


STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];
var ast      = require('../wisp/ast.js')
  , sequence = require('../wisp/sequence.js');
function processForms (forms) {

  var output = []
    , error  = []
    , state  = STATE_INIT
    , arg    = null;

  function isSymbol(f) {
    return f.constructor.type === 'wisp.symbol' && f.namespace === undefined;
  }

  function exitState(val) {
    if (val) output.push(val);
    state = STATE_INIT;
    arg = null;
  }

  for (var i = 0; i < forms.length; i++) {
    var form = forms[i]
      , type = form.constructor.type;

    console.log(form);

    if (state === STATE_INIT) {
      if (isSymbol(form) && form.name === 'use') {
        state = STATE_USE;
      } else if (isSymbol(form) && form.name === 'fn') {
        state = STATE_FN;
      } else if (isSymbol(form)) {
        state = STATE_DEF;
        arg   = form;
      }
    } else {
      if (isSymbol(form) && KEYWORDS.indexOf(form.name) != -1) {
        throw new Exception("Unexpected form: " + form.name);
      }
      if (state === STATE_USE) {
        exitState(sequence.list(
          ast.symbol(undefined, 'use'),
          form));
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

  console.log("\nOUTPUT", output)
  return output;

}


var wisp = require("../wisp/compiler.js");
function loadFile (err, data) {

  // wisp code
  if (err) throw err;
  data = preprocess(data);

  // wisp ast
  var read  = wisp.readForms(data, 'main.wisp')
    , forms = processForms(read.forms)
    , error = read.error;

  if (error) console.log("ERROR:", error, "\n");
  forms.map(function (f) { console.log(f) } );

  // js ast
  var ast = wisp.analyzeForms(forms);
  console.log("\n", ast);

  // js code
  var output = wisp.generate.bind(null, {}).apply(null, ast.ast);
  console.log("\n", output);

}


var fs = require('fs');
fs.readFile('main.wisp', { encoding: 'utf8' }, loadFile);
