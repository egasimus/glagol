var path = require('path')
  , vm   = require('vm');

var File = module.exports = function File () {

  // this looks like a class but is in fact a factory, returning a "callable
  // object", i.e. a Function with extra properties and bound methods.
  // if this was a class, the `new` keyword could've been made optional, and
  // thus its presence or absence effectively ignored. however, since the
  // return value of a constructor is ignored, this does not work vice-versa.
  // hence, we throw an exception.
  if (this instanceof File) {
    throw new Error("glagol.File is not really a class. Don't use the `new` operator. ")
  }

  // possible signatures:
  //   (options)
  //   (name, options)
  //   (name, source)
  var name, options;
  if (arguments[0] && typeof arguments[0] === 'object') {
    name = null;
    options = arguments[0];
  } else {
    name = arguments[0] || '';
    if (typeof arguments[1] === 'string') {
      options = { source: arguments[1] };
    } else {
      options = arguments[1] || {};
    }
  }

  // the core of our file object
  function file () { return file.value; }

  // basic properties
  file.options = options;
  file.parent = options.parent || null;
  file.runtime = options.runtime || getRuntime(name) || null;

  // actual values returned by getters are stored here
  file._cache =
    { source: options.source
    , compiled: undefined
    , evaluated: false
    , value: undefined };

  // manually inherit from prototype
  Object.keys(File.prototype).map(function (key) {
    file[key] = File.prototype[key].bind(file);
  });

  // set name
  Object.defineProperty(file, "name", { value: name });

  // some magic properties
  Object.defineProperties(file,
    { source: descriptor(getSource, setSource)
    , compiled: descriptor(compile)
    , value: descriptor(evaluate)
    , path: descriptor(getPath)
    , _glagol:
      { configurable: false
      , enumerable:   false
      , value: { version: require('../package.json').version
               , type:    "File" } } });

  // helper for shorter magic property descriptors
  function descriptor (getter, setter) {
    var d = { configurable: true, enumerable: true };
    if (getter) d.get = getter.bind(file);
    if (setter) d.set = setter.bind(file);
    return d;
  }

  return file;

};

function getRuntime (name) {
  return require('../runtimes/index.js')[path.extname(name)];
}

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
  this._cache.source = v;
  return v;
};

function compile () {

  if (this._cache.compiled) return this._cache.compiled;

  if (this.runtime) {

    if (this.source) {

      try {
        return this.compiled = this.runtime.compileSource.call(this);
      } catch (e) {
        console.error("Error compiling " + this.path + ":");
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
      , src     = "(function(){return " + this.compiled + "})()"
      , result  = vm.runInContext(src, context,
          { filename: this._sourcePath || this.path });

    if (context.error) throw context.error;

    this._cache.evaluated = true;
    if (context.hasOwnProperty('exports')) {
      return this._cache.value = context.exports;
    } else {
      return this._cache.value = result;
    }

  } else {
    return this.compiled;
  }

}

File.prototype.refresh = function refresh () {
  this._cache.compiled  = false;
  this._cache.evaluated = false;
}

File.prototype.makeContext = function () {
  var ctx  = this.runtime.makeContext.call(this);

  if (this.parent) {
    var tree = require('./tree.js')(this);
    ctx._  = tree;
    ctx.__ = tree.__;
    ctx.$  = tree.$;
  }

  return vm.createContext(ctx);
}

File.is = function (node) {
  return (node instanceof File ||
    (node._glagol instanceof Object && node._glagol.type === 'File'));
}
