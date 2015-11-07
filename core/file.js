var path = require('path')
  , fs   = require('fs')
  , vm   = require('vm');

var File = module.exports = function File () {

  var name, options;
  if (arguments[0] && typeof arguments[0] === 'object') {
    name = null;
    options = arguments[0];
  } else {
    name = arguments[0] || '';
    if (typeof arguments[1] === 'string') {
      options = { source: arguments[1] }
    } else {
      options = arguments[1] || {};
    }
  }

  // enforce usage of `new` keyword even if omitted
  if (!(this instanceof File)) return new File(name, options);

  // define basic properties
  this.name    = name;
  this.options = options;
  this.parent  = options.parent || null;

  this._cache =
    { source:   options.source
    , compiled: undefined
    , value:    undefined };

  this.runtime =
    options.runtime ||
    require('../runtimes/index.js')[path.extname(this.path)] ||
    null;

  // define "smart" properties which comprise the core of the live updating
  // magic: the file's contents are loaded, processed and updated on demand
  Object.keys(this._cache).map(function (k) {
    Object.defineProperty(this, k,
      { configurable: true
      , enumerable:   true
      , get: getter.bind(this, k)
      , set: setter.bind(this, k) });
  }, this);

  // hidden metadata for duck typing when instanceof fails
  Object.defineProperty(this, "_glagol",
    { configurable: false
    , enumerable:   false
    , value: { version: require('../package.json').version
             , type:    "File" } })

}

var operations = { source: "load", compiled: "compile", value: "evaluate" };

function getter (k) {
  return this._cache[k] === undefined
    ? this[operations[k]]()
    : this._cache[k];
}

function setter (k, v) {
  this._cache[k] = v;
}

File.prototype.load = function () {
  return this.path
    ? this.source = fs.readFileSync(this.path, "utf8")
    : undefined;
}

File.prototype.compile = function () {
  return this.source
    ? this.runtime
      ? (function () {
          try {
            return this.compiled = this.runtime.compileSource.call(this)
          } catch (e) {
            console.error("!!! ERROR compiling " + this.path);
            console.error(e.message);
            console.error(e.stack)
          }
        }).call(this)
      : this.source
    : undefined
}

File.prototype.evaluate = function () {
  return (this._cache.value !== undefined)
    ? this._cache.value
    : (this.source && this.compiled)
      ? this.runtime
        ? (function(){
            var context = this.makeContext()
              , src     = this.compiled
              , result  = vm.runInContext(src, context, { filename: this.path });
            if (context.error) throw context.error;
            return this._cache.value = result;
          }).call(this)
        : this.compiled
      : undefined;
}

File.prototype.refresh = function () {
  ["source", "compiled", "value"].map(function (k) {
    this._cache[k] = undefined;
  }, this);
}

File.prototype.makeContext = function () {
  var ctx  = this.runtime.makeContext(this, { path: this.path })
    , tree = this.parent ? require('./tree.js')(this) : {};

  ctx._  = tree;
  ctx.__ = tree.__;

  return vm.createContext(ctx);
}

File.is = function (node) {
  return (node instanceof File ||
    (node._glagol instanceof Object && node._glagol.type === 'File'));
}
