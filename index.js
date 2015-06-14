PORT       = "4194";
STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];

var ast        = require('wisp/ast.js')
  , browserify = require('browserify')
  , colors     = require('colors/safe')
  , fs         = require('fs')
  , http       = require('http')
  , observ     = require('observ')
  , path       = require('path')
  , runtime    = require('wisp/runtime.js')
  , sendHTML   = require('send-data/html')
  , sendJSON   = require('send-data/json')
  , sequence   = require('wisp/sequence.js')
  , vm         = require('vm')
  , wisp       = require('wisp/compiler.js');
  //, vm2        = require("vm2");

var log = getLogger('editor');

fs.readFile('main.wisp', { encoding: 'utf8' }, loadFile);

function loadFile (err, source) {

  var compiled = compileSource(source, 'main.wisp')
    , context  = makeContext('main');
  process.nextTick(function(){
    vm.runInContext(compiled.output.code, context);
  })

  // bundle code
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

  // live editor
  http.createServer(function (req, res) {
    if (req.url === '/') {
      sendHTML(req, res, { body: '<body><script>' + bundled + '</script>' });
    } else if (req.url === '/forms') {
      sendJSON(req, res, compiled.forms);
    } else if (req.url === '/repl') {
      if (req.method === 'POST') {
        var data = '';
        req.on('data', function (buf) {
          data += buf;
        });
        req.on('end', function () {
          log("Executing:\n" + data);
          vm.runInContext(compileSource(data, 'repl').output.code, context);
          sendJSON(req, res, {});
        });
      }
    }
  }).listen(PORT);

  log('Listening on', PORT);

}

function compileSource (source, fullpath) {
  var forms     = preprocess(wisp.readForms(source, 'main.wisp'), source)
      processed = wisp.analyzeForms(forms)
      options   = { 'source-uri': fullpath , 'source': source }
      output    = wisp.generate.bind(null, options).apply(null, processed.ast);
  return { forms: forms, processed: processed, output: output }
}

function makeContext (name) {
  var context =
    { exports: {}
    , log:     getLogger(name)
    , require: function (module) { return require(module) }
    , atom:    function (value)  { return makeAtom(value) } };
  context.use = useModule.bind(null, context);
  [ ast
  , sequence
  , runtime ].map(
    function(m) { Object.keys(m).map(function(k) { context[k] = m[k] })});
  return vm.createContext(context);
}

function getLogger (from) {
  return function logger () {
    var args = [];
    for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
    console.log(colors.yellow(from), args.join(" "));
  }
}

function useModule (context, name) {
  var fullpath  = findModule(name)
    , source    = fs.readFileSync(fullpath, { encoding: 'utf8' })
    , output    = compileSource(source, fullpath).output
    , context   = makeContext(name);
  vm.runInContext(output.code, context);
  return context;
}

function findModule (name) {
  return path.resolve(path.join('.', 'lib', name + '.wisp'));
}

function makeAtom (value) {
  var atom = observ(value);
  return {
    get:      function ()    { return atom() },
    watch:    function (cb)  { atom(cb)      },
    set:      function (val) { atom.set(val) },
    metadata: value.metadata
  }
}

function preprocess (read, source) {

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
    obj.metadata.type = 'array';
    return obj
  }

  function exposeMetadata(f) {
    if (f instanceof Array) f = arrayToObject(f);
    Object.defineProperty(f, 'metadata', { enumerable: true });
    if (!f.metadata.type) f.metadata.type = f.constructor.type;
    f.metadata.source = getSource(f);
    return f;
  }

  function makePrivate(f) {
    f = ast.withMeta(f, { 'private': true });
    Object.defineProperty(f, 'metadata', { enumerable: true });
    return f;
  } 

  var sym  = ast.symbol.bind(null, undefined)
    , list = sequence.list;

  for (var i = 0; i < forms.length; i++) {
    var f    = exposeMetadata(forms[i])
      , type = f.constructor.type;

    if (state === STATE_INIT) {

      if (isSymbol(f) && f.name === 'use') {
        state = STATE_USE;
        meta  = f.metadata;

      } else if (isSymbol(f) && f.name === 'fn') {
        state = STATE_FN;
        meta  = f.metadata;

      } else if (isSymbol(f)) {
        state = STATE_DEF;
        meta  = f.metadata;
        arg   = f;

      } else if (f.metadata.type === 'wisp.list') {
        output.push(f);

      } else unexpectedForm(f, i);

    } else {

      if (isSymbol(f) && KEYWORDS.indexOf(f.name) != -1) {
        unexpectedForm(f, i);
      }

      if (state === STATE_USE) {
        exitState(list(sym('def'), makePrivate(sym(f.name)), list(sym('use'), f.name)));
        meta = meta || {};
        meta.use = true;

      } else if (state === STATE_FN) {
        if (arg === null) {
          arg = f;
        } else {
          exitState(list(sym('defn'), arg, f));
        }

      } else if (state === STATE_DEF) {
        exitState(list(sym('def'), arg, list(sym('atom'), f)));
      }

    }

  }

  return output;

}
