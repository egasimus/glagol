module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext
  , requireWisp:   requireWisp };

var fs      = require('fs')
  , logging = require('./logging.js')
  , vm      = require('vm');

var wisp = module.exports.wisp =
  { ast:      require('wisp/ast.js')
  , compiler: require('wisp/compiler.js')
  , runtime:  require('wisp/runtime.js')
  , sequence: require('wisp/sequence.js') };

var log = logging.getLogger('runtime');

function compileSource (source, fullpath, raw) {
  raw = raw || false;
  var forms     = wisp.compiler.readForms(source, fullpath)
    , forms     = forms.forms;

  var processed = wisp.compiler.analyzeForms(forms)
  if (processed.error) throw new Error("Compile error: " + processed.error);

  var options   = { 'source-uri': fullpath , 'source': source }
    , output    = wisp.compiler.generate.bind(null, options).apply(null, processed.ast);
  output.code = wrap(output.code);

  return { forms: forms, processed: processed, output: output }
}

function wrap (code, map) {
  // TODO make source maps work
  var sep = "//# sourceMappingURL=data:application/json;base64,";
  var mapped = code.split(sep);
  return (!map ? [] : [
    'require("source-map-support").install({retrieveSourceMap:function(){',
    'return{url:null,map:"', mapped[1].trim(), '"}}});'
  ]).concat([
    'error=null;try{', mapped[0],
    '}catch(e){error=e}',
  ]).join("");
}

function importIntoContext (context, obj) {
  Object.keys(obj).map(function(k) { context[k] = obj[k] });
}

function makeContext (name, elevated) {
  var _require = function (module) { return require(module) };
  _require.main = require.main;
  var context =
    { exports:      {}
    , __dirname:    __dirname
    , log:          logging.getLogger(name)
    , use:          requireWisp
    , process:      { cwd: process.cwd() }
    , isInstanceOf: function (type, obj) { return obj instanceof type }
    , require:      _require
    , deref:        function (atom)      { return atom.value()        } };

  if (elevated) {
    context.process = process;
    context.require = require;
  }

  [ wisp.ast
  , wisp.sequence
  , wisp.runtime ].map(importIntoContext.bind(null, context));

  return vm.createContext(context);
}

function requireWisp (name, raw, elevated) {
  raw = raw || false;
  var fullpath = name
    , source   = fs.readFileSync(fullpath, { encoding: 'utf8' })
    , output   = compileSource(source, fullpath, raw).output
    , context  = makeContext(name, elevated);
  vm.runInContext(output.code, context, { filename: name });
  return context.exports;
}
