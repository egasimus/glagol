var path = require('path');

var Directory = module.exports = function Directory () {

  var name, options;
  if (arguments[0] && typeof arguments[0] === 'object') {
    name    = null;
    options = arguments[0];
  } else {
    name    = arguments[0] || '';
    options = arguments[1] || {};
  }

  // enforce usage of `new` keyword even if omitted
  if (!(this instanceof Directory)) return new Directory(name, options);

  this.name    = name;
  this.nodes   = {};
  this.options = options;
  this.parent  = options.parent || null;

  Object.defineProperties(this,
    { path:    // path of node relative to app root
      { configurable: true
      , enumerable:   true
      , get: getPath.bind(this) }
    , tree:    // just nested value objects, no metadata
      { configurable: true
      , enumerable:   true
      , get: getTree.bind(this) }
    , _glagol: // hidden metadata for duck typing when instanceof fails
      { configurable: false
      , enumerable:   false
      , value: { version: require('../package.json').version
               , type:    "Directory" } } });

};

function getPath () {
  if (this.parent) {
    return this.parent.path +
      (this.parent.parent ? '/' : '') +
      this.name;
  } else {
    return '/';
  }
}

function getTree () {
  return require('./tree.js')(this);
}

Directory.prototype.add = function (node) {
  // if the new child node is identical to the old one, adding it is a no-op
  // alternatively, the old child is cleanly removed and the new one installed

  if (this.nodes[node.name]) {
    if (this.nodes[node.name] === node) return;
    this.remove(node.name);
  }

  node.parent = this;
  this.nodes[node.name] = node;

  return this;
}

Directory.prototype.remove = function (nodeOrName) {
  // nodes can be removed either by reference or by name

  var name = (typeof nodeOrName === 'string') ? nodeOrName : nodeOrName.name;
  this.nodes[name].parent = null;
  delete this.nodes[name];

  return this;
}

Directory.prototype.bind = function () { // TODO nested?
  Array.prototype.forEach.call(arguments, function (node) {
    Object.keys(node.nodes).forEach(function (name) {
      this.add(node.nodes[name]);
    }, this);
  }, this);

  return this;
}

Directory.prototype.mount = function () {
  Array.prototype.forEach.call(arguments, this.add.bind(this));

  return this;
}

Directory.prototype.get = function (relPath) {
  var node  = this,
      steps = relPath.split("/");
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (step === '') continue; // ignore initial and/or multiple slashes
    if (-1 === Object.keys(node.nodes).indexOf(step)) return null;
    node = node.nodes[step];
    if (i < steps.length - 1 && !Directory.is(node)) return null;
  }
  return node;
}

Directory.is = function (node) {
  return (node instanceof Directory ||
    (node._glagol instanceof Object && node._glagol.type === 'Directory'));
}
