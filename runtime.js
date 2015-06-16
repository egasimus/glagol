var fs         = require('fs')
  , logging    = require('./logging.js')
  , observ     = require('observ')
  , path       = require('path')
  , preprocess = require('./preprocess.js')
  , vm         = require('vm');

var wisp =
  { ast:      require('wisp/ast.js')
  , compiler: require('wisp/compiler.js')
  , runtime:  require('wisp/runtime.js')
  , sequence: require('wisp/sequence.js') };

var compileSource = exports.compileSource = function compileSource (source, fullpath, raw) {
  raw = raw || false;
  var forms     = wisp.compiler.readForms(source, FILE)
    , forms     = raw ? forms.forms : preprocess(forms, source, fullpath);

  var processed = wisp.compiler.analyzeForms(forms)
  if (processed.error) throw new Error("Compile error: " + processed.error);

  var options   = { 'source-uri': fullpath , 'source': source }
    , output    = wisp.compiler.generate.bind(null, options).apply(null, processed.ast);

  return { forms: forms, processed: processed, output: output }
}

function importIntoContext (context, obj) {
  Object.keys(obj).map(function(k) { context[k] = obj[k] });
}

var makeContext = exports.makeContext = function makeContext (name) {
  var context =
    { exports:      {}
    , log:          logging.getLogger(name)
    , use:          requireWisp
    , isInstanceOf: function (a, b)   { return a instanceof b  }
    , require:      function (module) { return require(module) }
    , atom:         function (value)  { return makeAtom(value) }
    , deref:        function (atom)   { return atom.get()      } };

  [ wisp.ast
  , wisp.sequence
  , wisp.runtime ].map(importIntoContext.bind(null, context));

  return vm.createContext(context);
}

var requireWisp = exports.requireWisp = function requireWisp (name, raw) {
  raw = raw || false;
  var fullpath  = raw ? name : findModule(name)
    , source    = fs.readFileSync(fullpath, { encoding: 'utf8' })
    , output    = compileSource(source, fullpath, raw).output
    , context   = makeContext(name);
  vm.runInContext(output.code, context, { filename: name });
  return context.exports;
}

function findModule (name) {
  return path.resolve(path.join('.', 'lib', name + '.wisp'));
}

function makeAtom (value) {

  var atom = observ(value);

  return {
    metadata: value.metadata,

    get:    function ()    { return atom() },
    watch:  function (cb)  { atom(cb)      },
    set:    function (val) { atom.set(val) },
    update: function (cb)  {
      var val = atom();
      if (val.destroy) {
        val.destroy(function () { atom.set(cb(val)) });
      } else {
        atom.set(cb(val));
      }
    }
  }

}
