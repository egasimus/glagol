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
  Object.defineProperty(this, 'target',
    { configurable: true
    , enumerable:   true
    , get:          getTarget.bind(this)
    , set:          setTarget.bind(this) })
  this.target  = target;

  this.options = options;
  this.parent  = options.parent || null;

  // magic properties
  Object.defineProperties(this,
    { path:
      { configurable: true
      , enumerable:   true
      , get: getPath.bind(null, this) }
    , events:
      { configurable: true
      , enumerable:   true
      , get: getEvents.bind(null, this) }
    , _glagol:
      { configurable: false
      , enumerable:   false
      , value:
        { version: require('../package.json').version
        , type:    "File" } } });


}

function getPath (link) {
  return link.target ? link.target.path : null;
}

function getEvents (link) {
  return link.target ? link.target.events : null;
}

function defineTargetProperties (link) {

  ['source', 'compiled', 'value', 'nodes'].forEach(
    function (key) { delete link[key] })

  if (File.is(link.target)) {
    ['source', 'compiled', 'value'].forEach(installTargetProperty.bind(null, this))
  } else {
    installTargetProperty(this, 'nodes');
  }

}

function getTarget () {
  return this._target;
}

function setTarget (target) {
  this.name   = target ? target.name  || null;
  this.events = target ? target.evens || null;
  defineTargetProperties(this)
  return this._target = target;
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
