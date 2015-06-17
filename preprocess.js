STATE_INIT = "init";
STATE_USE  = "use";
STATE_FN   = "fn";
STATE_DEF  = "def";
KEYWORDS   = ["use", "fn", "def"];

var wisp = { ast:      require('wisp/ast.js')
           , sequence: require('wisp/sequence.js') };

var preprocess = module.exports = function preprocess (read, source, fullpath) {

  if (read.error) throw new Error("Reader error in " + fullpath + ":\n" + read.error);

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
    if (meta) val = wisp.ast.withMeta(f, meta);
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
    f = wisp.ast.withMeta(f, { 'private': true });
    Object.defineProperty(f, 'metadata', { enumerable: true });
    return f;
  } 

  var sym  = wisp.ast.symbol.bind(null, undefined)
    , list = wisp.sequence.list;

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
        if (f instanceof String) {
          var alias = f.match(new RegExp("([^/]+?).wisp"))[1]; 
          exitState(list(sym('def'), makePrivate(sym(alias)), list(sym('require'), f)));
        } else {
          exitState(list(sym('def'), makePrivate(sym(f.name)), list(sym('use'), f.name)));
        }
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
