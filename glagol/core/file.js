var path   = require('path')
  , extend = require('extend')
  , EE2    = require('eventemitter2').EventEmitter2
  , error  = require('./error');

var File = module.exports = function File () {

  if (this instanceof File) throw error.NOT_A_CONSTRUCTOR("glagol.File");

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
      options = extend({ source: arguments[1] }, arguments[2] || {});
    } else {
      options = arguments[1] || {};
    }
  }

  // the core of our file object
  function file () { return file.value; }

  // basic info
  Object.defineProperty(file, "name", { value: name });
  file._options = options;
  file.parent = options.parent || null;
  file.events = new EE2({ maxListeners: 0 });

  // bind methods
  file.reset = reset.bind(file);
  file.get = get.bind(file);
  file.mount = mount.bind(file);

  // actual values returned by getters are stored here
  file._cache =
    { source: options.source
    , compiled: undefined
    , evaluated: false
    , value: undefined };

  // some magic properties
  Object.defineProperties(file,
    { source: descriptor(getSource, setSource)
    , compiled: descriptor(compile)
    , value: descriptor(evaluate)
    , path: descriptor(getPath)
    , format: descriptor(getFormat)
    , options: descriptor(getOptions, setOptions)
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

File.is = function (node) {
  return node &&
    node._glagol instanceof Object &&
    node._glagol.type === 'File';
};

function getPath () {
  if (!this.parent) return this.name;
  return this.parent.path +
    (this.parent.parent ? '/' : '') +
    this.name;
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
  if (!this.format) return this._cache.compiled = this.source;
  if (!this.source && this.source !== '') return this._cache.compiled = undefined;

  try {
    return this._cache.compiled = this.format.compile(this);
  } catch (e) {
    console.error("Error compiling " + this.path + ":");
    console.log(e.message);
    console.log(e.stack);
  }

}

function evaluate () {

  if (this._cache.evaluated) return this._cache.value;
  if (!this.format) return this.compiled;

  this._cache.value = this.format.evaluate(this);
  this._cache.evaluated = true;
  return this._cache.value;

}

function reset () {
  this._cache.compiled  = false;
  this._cache.evaluated = false;
  this._cache.value = undefined;
  return this;
}

function get (location) {
  return this.parent.get(location);
}

function mount (target) {
  if (process.browser) throw error.CAN_NOT_MOUNT_IN_BROWSER();
  this._mountTarget = this._loader(path.resolve(this._sourcePath, target));
  this._cache.value = this._mountTarget();
  return this._cache.value;
}

function getFormat () {
  return this.options.format ||
    this.options.formats[path.extname(this.name)] ||
    this.options.formats[null] ||
    null;
}

function getOptions () {
  return this._options;
}

function setOptions (v) {
  var baseOptions = this.parent ? this.parent.options : {};
  this._options = extend(true, baseOptions, v);
  this.reset();
  return v;
}
