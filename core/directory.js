var path = require('path');

var Directory = module.exports = function Directory () {

  // this is a factory (see file.js)
  if (this instanceof Directory) {
    throw new Error("glagol.Directory is not really a class. " +
      "Don't use the `new` operator. ")
  }

  // possible signatures:
  //   (options)
  //   (name, options)
  var name, options;
  if (arguments[0] && typeof arguments[0] === 'object') {
    name    = null;
    options = arguments[0];
  } else {
    name    = arguments[0] || '';
    options = arguments[1] || {};
  }

  // the core of our directory object
  function directory () { return directory.tree }

  // basic info
  Object.defineProperty(directory, "name", { value: name });
  directory.name = name;
  directory.nodes = {};
  directory.options = options;
  directory.parent = options.parent || null;

  // bind methods
  directory.add = add.bind(directory);
  directory.remove = add.bind(directory);
  directory.bind = bind.bind(directory);
  directory.mount = mount.bind(directory);
  directory.get = get.bind(directory);

  // magic properties
  Object.defineProperties(directory,
    { path: descriptor(getPath) // path of node relative to app root
    , tree: descriptor(getTree) // just nested value objects, no metadata
    , _glagol: // hidden metadata for duck typing
      { configurable: false
      , enumerable:   false
      , value: { version: require('../package.json').version
               , type:    "Directory" } } });

  // helper for shorter magic property descriptors
  function descriptor (getter, setter) {
    var d = { configurable: true, enumerable: true };
    if (getter) d.get = getter.bind(directory);
    if (setter) d.set = setter.bind(directory);
    return d;
  }

  return directory;

};

Directory.is = function (node) {
  return (node instanceof Directory ||
    (node._glagol instanceof Object && node._glagol.type === 'Directory'));
}

function getPath () {
  if (!this.parent) return "/";

  var p = this.parent.path;
  if (this.parent.parent) p += "/"
  p += this.name;
  return p;
}

function getTree () {
  return require('./tree.js')(this);
}

function add (node) {
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

function remove (nodeOrName) {
  // nodes can be removed either by reference or by name

  var name = (typeof nodeOrName === 'string') ? nodeOrName : nodeOrName.name;
  this.nodes[name].parent = null;
  delete this.nodes[name];

  return this;
}

function bind () { // TODO nested?
  Array.prototype.forEach.call(arguments, function (node) {
    Object.keys(node.nodes).forEach(function (name) {
      this.add(node.nodes[name]);
    }, this);
  }, this);

  return this;
}

function mount () {
  Array.prototype.forEach.call(arguments, this.add.bind(this));

  return this;
}

function get (relPath) {
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
