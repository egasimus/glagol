var File      = require('glagol').File
  , Directory = require('glagol').Directory;

module.exports = function thaw (ice, parent) {

  if (parent && !(Directory.is(parent)))
    throw ERR_WRONG_PARENT(parent, ice)

  if (ice.nodes) {
    var node = Directory(ice.name)
    Object.keys(ice.nodes).map(install);
    function install (i) { node.nodes[i] = thaw(ice.nodes[i], node); }
  } else if (ice.code) {
    var node = File(ice.name, ice.code);
  } else {
    throw ERR_FOREIGN_BODY(ice);
  }

  node.parent = parent;

  return node;

}

function ERR_WRONG_PARENT (parent, ice) {
  return Error('parent must be instance of Directory')
}

function ERR_FOREIGN_BODY (ice) {
  return Error("can't thaw unknown instance in frozen glagol tree: ",
    + JSON.stringify(ice));
}
