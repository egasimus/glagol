var path = require('path')
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

  // basic properties
  this.name    = name;
  this.options = options;
  this.parent  = options.parent || null;
  this.runtime =
    options.runtime ||
    require('../runtimes/index.js')[path.extname(this.name)] ||
    null;

  // stores actual values of source, compiled and value properties
  this._cache =
    { source:    options.source
    , compiled:  undefined
    , evaluated: false
    , value:     undefined };

  // magic properties
  Object.defineProperties(this,
    { source:
      { configurable: true
      , enumerable:   true
      , get: getSource.bind(this)
      , set: setSource.bind(this) }
    , compiled:
      { configurable: true
      , enumerable:   true
      , get: compile.bind(this) }
    , value:
      { configurable: true
      , enumerable:   true
      , get: evaluate.bind(this) }
    , path:
      { configurable: true
      , enumerable:   true
      , get: getPath.bind(this) }
    , _glagol:
      { configurable: false
      , enumerable:   false
      , value:
        { version: require('../package.json').version
        , type:    "File" } } });

};

function getPath () {
  if (this.parent) {
    return this.parent.path +
      (this.parent.parent ? '/' : '') +
      this.name;
  } else {
    return this.name;
  }
}

function getSource () {
  return this._cache.source;
}

function setSource (v) {
  this._cache.compiled = undefined;
  this._cache.evaluated = false;
  return this._cache.source = v;
};

function compile () {

  if (this._cache.compiled) return this._cache.compiled;

  if (this.runtime) {

    if (this.source) {

      try {
        return this.compiled = this.runtime.compileSource.call(this);
      } catch (e) {
        console.error("Error compiling " + this.name + ":");
        console.log(e.message);
        console.log(e.stack);
      }

    } else {
      return this._cache.compiled = undefined;
    }

  } else {
    return this._cache.compiled = this.source;
  }

}

function evaluate () {

  if (this._cache.evaluated) return this._cache.value;

  if (this.runtime) {

    var context = this.makeContext()
      , src     = this.compiled
      , result  = vm.runInContext(src, context, { filename: this.filename });

    if (context.error) throw context.error;

    if (context.hasOwnProperty('exports')) {
      return this._cache.value = context.exports;
    } else {
      return this._cache.value = result;
    }

  } else {
    return this.compiled;
  }

}

File.prototype.refresh = function () {
  this._cache.compiled  = false;
  this._cache.evaluated = false;
}

File.prototype.makeContext = function () {
  var ctx  = this.runtime.makeContext.call(this);

  if (this.parent) {
    var tree = require('./tree.js')(this);
    ctx._  = tree;
    ctx.__ = tree.__;
  }

  return vm.createContext(ctx);
}

File.is = function (node) {
  return (node instanceof File ||
    (node._glagol instanceof Object && node._glagol.type === 'File'));
}
