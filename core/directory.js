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
  this.events  = new (require('eventemitter3'))()

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

Directory.prototype.get = function (relPath) {

  var node  = this,
      steps = relPath.split("/");

  for (var i = 0; i < steps.length; i++) {

    var step = steps[i];

    if (-1 === Object.keys(node.nodes).indexOf(step)) {
      ERR_BROKEN_PATH(step, relPath);
    }

    node = node.nodes[step];

    if (i < steps.length - 1 && node.type !== "Directory") {
      ERR_REACHED_FILE(step, relPath);
    }
  }

  return node;

}

Directory.prototype.add = function (node) {
  if (this.nodes[node.name]) {
    this.remove(node.name);
  }
  this.nodes[node.name] = node;
}

Directory.prototype.remove = function (nodeOrName) {
  if (typeof nodeOrName === "string") {
    delete this.nodes[nodeOrName];
  } else {
    delete this.nodes[node.name];
  }
}

Directory.prototype.mount = function (dir) { // TODO multiarg
  Object.keys(dir.nodes).forEach(function (name) {
    this.add(dir.nodes[name]);
    dir.nodes[name].parent = this;
  }, this)
}

function ERR_BROKEN_PATH(step, path) {
  throw Error("Missing step " + step + " in path " + path);
}

function ERR_REACHED_FILE(step, path) {
  throw Error("Step " + step + " in path " + path + " is a file");
}

Directory.is = function (node) {
  return (node instanceof Directory ||
    (node._glagol instanceof Object && node._glagol.type === 'Directory'));
}
