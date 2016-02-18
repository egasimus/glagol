var File      = require('./file.js')
  , Directory = require('./directory.js')
  , error     = require('./error.js');

var getTree = module.exports = function getTree (node) {

  // from file, . points to parent and .. to grandparent;
  // from dir, .. points to parent and . to self.

  if (File.is(node)) {

    if (!node.parent) throw error.TREE_NO_PARENT(node.name);
    return getTree(node.parent);

  } else if (Directory.is(node)) {

    var tree = {};

    Object.keys(node.nodes).map(function (name) {
      Object.defineProperty(tree, translate(name),
        { configurable: true
        , enumerable:   true
        , get: getter.bind(node, name)
        , set: setter.bind(node, name) }); });

    addHiddenProperty(tree, '_',  tree);
    addHiddenProperty(tree, '__', node.parent ? getTree(node.parent) : null);
    addHiddenProperty(tree, '$',  getRoot(tree));

    return tree;

  } else throw error.FOREIGN_BODY(node);

};

function getRoot (tree) {
  while (tree.__) tree = tree.__;
  return tree;
}

function getter (name) {
  return this.nodes[name]();
}

function setter (name, value) {
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
