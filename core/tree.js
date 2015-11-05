var getTree = module.exports = function getTree (node) {

  // from file, . points to parent and .. to grandparent;
  // from dir, .. points to parent and . to self.

  if (node.type === "Script") {

    if (!node.parent) ERR_NO_PARENT(node);
    return getTree(node.parent);

  } else if (node.type === "Directory") {

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
  return node.type === "Script"
    ? node.value
    : node.type === "Directory"
      ? getTree(node)
      : ERR_UNKNOWN_TYPE(node);
}

function setter (node, value) {
  ERR_CANT_SET();
}

function translate (name) {
  // strip extension
  if (-1 < name.indexOf('.')) name = name.substr(0, name.lastIndexOf('.'))

  // replace hyphen with camelCase
  // TODO

  return name;
}

function ERR_NO_PARENT (node) {
  throw Error("node " + node.name + " is not connected to a tree");
}

function ERR_UNKNOWN_TYPE (node) {
  throw Error("foreign body in script tree, possible name: "
    + JSON.stringify(node.name));
}

function ERR_CANT_SET () {
  throw Error("setting values of tree nodes is not implemented yet")
}
