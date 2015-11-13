var File      = require('./file.js')
  , Directory = require('./directory.js');

var getTree = module.exports = function getTree (node) {

  // from file, . points to parent and .. to grandparent;
  // from dir, .. points to parent and . to self.

  if (File.is(node)) {

    if (!node.parent) ERR_NO_PARENT(node);
    return getTree(node.parent);

  } else if (Directory.is(node)) {

    var tree = {};
    tree._ = tree;
    Object.keys(node.nodes).map(function (name) {
      Object.defineProperty(tree, translate(name), {
        configurable: true,
        enumerable: true,
        get: getter.bind(null, node.nodes[name]),
        set: setter.bind(null, node.nodes[name])
      });
    });
    if (node.parent) tree.__ = getTree(node.parent);
    return tree;

  } else throw ERR_UNKNOWN_TYPE(node);

};

function getter (node) {
  return File.is(node)
    ? node.value
    : Directory.is(node)
      ? getTree(node)
      : ERR_UNKNOWN_TYPE(node);
}

function setter (node, value) {
  ERR_CANT_SET();
}

function translate (name) {
  // strip extension, replace hyphenated-identifiers with camelCasedOnes
  if (-1 < name.indexOf('.')) name = name.substr(0, name.lastIndexOf('.'))
  name = name.replace(/-(.)/g, function (g) { return g[1].toUpperCase() });

  return name;
}

function ERR_NO_PARENT (node) {
  throw Error("node " + node.name + " is not connected to a tree");
}

function ERR_UNKNOWN_TYPE (node) {
  throw Error("foreign body in glagol tree: " + JSON.stringify(node));
}

function ERR_CANT_SET () {
  throw Error("setting values of tree nodes is not implemented yet")
}
