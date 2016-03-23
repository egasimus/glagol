var path   = require('path')
  , EE2    = require('eventemitter2').EventEmitter2
  , extend = require('extend');

var error  = require('./error')
  , File   = require('./file');

var Directory = module.exports = function Directory () {

  // this is a factory (see file.js)
  if (this instanceof Directory) throw error.NOT_A_CONSTRUCTOR("glagol.Directory");

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
  function directory () {
    if (!directory._cache) directory._cache = getTree(directory);
    return directory._cache;
  }

  // basic info
  Object.defineProperty(directory, "name", { value: name });
  directory.name = name;
  directory.nodes = {};
  directory._options = options;
  directory.parent = options.parent || null;

  // events, w/ bubbling
  directory.events = new EE2({ maxListeners: 0 });
  directory.events.on('added', function (node) {
    if (directory.parent) directory.parent.events.emit('added', node);
  });
  directory.events.on('changed', function (node) {
    if (directory.parent) directory.parent.events.emit('changed', node);
  });
  directory.events.on('removed', function (node, parent) {
    if (directory.parent) directory.parent.events.emit('removed', node, parent);
  });

  // bind methods
  directory.add = add.bind(directory);
  directory.remove = remove.bind(directory);
  directory.overlay = overlay.bind(directory);
  directory.get = get.bind(directory);
  directory.reset = reset.bind(directory);

  // magic properties
  Object.defineProperties(directory,
    { path: descriptor(getPath)
    , root: descriptor(getRoot)
    , options: descriptor(getOptions, setOptions)
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
  return node &&
    node._glagol instanceof Object &&
    node._glagol.type === 'Directory';
};

function getPath () {
  if (!this.parent) return '/';
  return this.parent.path +
    (this.parent.parent ? '/' : '') +
    this.name;
}

function getRoot () {
  // find app root
  var root = this;
  while (root.parent) root = root.parent;
  return root;
}

function add (node) {

  if (!node.name) throw error.ADD_NAMELESS_NODE(this.path);

  delete this._cache;

  // TODO check for strange loop

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

function remove (node) {
  // nodes can be removed either by reference or by name

  delete this._cache;

  if (typeof node === 'string') node = this.get(node);
  node.parent = null;
  delete this.nodes[node.name];

  return this;

}

function overlay () {

  delete this._cache;

  var self = this;

  Array.prototype.forEach.call(arguments, function (node) {

    Object.keys(node.nodes).forEach(function (name) {
      overlayOne(node.nodes[name]);
    });

    node.events.on('added', overlayOne);

    function overlayOne (newNode) {
      var oldNode = self.nodes[newNode.name];
      if (Directory.is(oldNode) && Directory.is(newNode)) {
        oldNode.overlay(newNode);
      } else {
        if (oldNode) self.remove(oldNode);
        self.add(newNode);
      }
    }

  });

  return this;

}

function reset () {

  delete this._cache;

  var nodes = this.nodes;
  Object.keys(nodes).forEach(function (id) {
    nodes[id].reset();
  });

  return this;

}

function get (location) {

  var current = location[0] === '/' ? this.root : this
    , steps   = location.split('/');

  for (var i = 0; i < steps.length; i++) {

    var step = steps[i];

    if (step === '' || step === '.') continue; // ignore empty steps

    if (step === '..') {
      if (!current.parent) return null;
      current = current.parent;
    } else {
      if (-1 === Object.keys(current.nodes).indexOf(step)) return null;
      current = current.nodes[step];
      if (i < steps.length - 1 && !Directory.is(current)) return null;
    }

  }

  return current;

}

function getOptions () {
  var baseOptions = {};
  if (this.parent) baseOptions = this.parent.options;
  return extend(true, baseOptions, this._options);
}

function setOptions (v) {
  this._options = v;
  this.reset();
  return this._options;
}

function getTree (node) {

  if (File.is(node)) {

    if (!node.parent) throw error.TREE_NO_PARENT(node.name);
    return getTree(node.parent);

  } else if (Directory.is(node)) {

    var tree = {};

    Object.keys(node.nodes).map(function (name) {
      Object.defineProperty(tree, translate(name),
        { configurable: true
        , enumerable:   true
        , get: treeGetter.bind(node, name)
        , set: treeSetter.bind(node, name) }); });

    addHiddenProperty(tree, '_',  tree);
    addHiddenProperty(tree, '__', node.parent ? getTree(node.parent) : null);
    addHiddenProperty(tree, '$',  getTreeRoot(tree));

    return tree;

  } else {

    throw error.FOREIGN_BODY(node);

  }

}

function getTreeRoot (tree) {
  while (tree.__) tree = tree.__;
  return tree;
}

function treeGetter (name) {
  var node = this.nodes[name];
  if (!node) return undefined;
  return this.nodes[name]();
}

function treeSetter (name, value) {
  throw error.TREE_CAN_NOT_SET(this.path, name);
}

function translate (name) {
  // strip extension, replace hyphenated-identifiers with camelCasedOnes
  if (-1 < name.indexOf('.')) name = name.substr(0, name.lastIndexOf('.'));
  name = name.replace(/-(.)/g, function (g) { return g[1].toUpperCase(); });
  return name;
}

function addHiddenProperty (obj, id, val) {
  Object.defineProperty(obj, id, {
    configurable: true,
    enumerable:   false,
    value:        val
  });
}
