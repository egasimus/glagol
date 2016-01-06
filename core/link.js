var File      = require('./file.js')
  , Directory = require('./directory.js')

var Link = module.exports = function Link () {

  // parse initial arguments
  var target = null, options = arguments[1] || {};
  if (arguments[0]) {
    if (File.is(arguments[0]) || Directory.is(arguments[0])) {
      target = arguments[0];
    } else {
      options = arguments[0] || {};
    }
  }

  // enforce usage of `new` keyword even if omitted
  if (!(this instanceof Link)) return new Link(target, options);

  // basic properties
  this._target = target; // cache for getter/setter
  this.name    = target ? target.name || null;
  this.options = options;
  this.parent  = options.parent || null;

  // magic properties
  Object.defineProperties(this,
    { target:
      { configurable: true
      , enumerable:   true
      , get:          getTarget.bind(this)
      , set:          setTarget.bind(this) }
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

  defineTargetProperties(this)

}

function defineTargetProperties(link) {

  delete link.source;
  delete link.compiled;
  delete link.value;
  delete link.nodes;

  if (File.is(link.target)) {
    ['source', 'compiled', 'value'].forEach(installTargetProperty.bind(null, this))
  } else {
    installTargetProperty(this, 'nodes');
  }

}

function getTarget () {
  return this._target;
}

function setTarget (newTarget) {
  return this._target = newTarget; // what else?
}

function installTargetProperty (link, property) {
  Object.defineProperty(link, property,
    { configurable: true
    , enumerable:   true
    , get:          getFromTarget.bind(link, property)
    , set:          setOntoTarget.bind(link, property) })
}

function getFromTarget (property) {
  return this._target[property]
}

function setOntoTarget (property, value) {
  return this._target[property] = value;
}
