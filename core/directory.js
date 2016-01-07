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

Directory.prototype.tree = function () {
  return require('./tree.js')(this);
}

Directory.prototype.add = function (node) {
  if (this.nodes[node.name]) this.remove(node.name);
  node.parent = this;
  this.nodes[node.name] = node;
}

Directory.prototype.remove = function (nodeOrName) {
  var name = (typeof nodeOrName === 'string') ? nodeOrName : nodeOrName.name;
  this.nodes[name].parent = null;
  delete this.nodes[name];
}

Directory.prototype.mount = function (dir) { // TODO multiarg
  Object.keys(dir.nodes).forEach(
    function (name) { this.add(dir.nodes[name]); }, this);
}

Directory.prototype.get = function (relPath) {
  var node  = this,
      steps = relPath.split("/");
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (-1 === Object.keys(node.nodes).indexOf(step)) {
      throw Error("Missing step " + step + " in path " + relPath);
    }
    node = node.nodes[step];
    if (i < steps.length - 1 && !Directory.is(node)) {
      throw Error("Step " + step + " in path " + relPath + " is a file");
    }
  }
  return node;
}

Directory.is = function (node) {
  return (node instanceof Directory ||
    (node._glagol instanceof Object && node._glagol.type === 'Directory'));
}
