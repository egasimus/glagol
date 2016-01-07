var File      = require('glagol').File
  , Directory = require('glagol').Directory;

module.exports = function thaw (ice, parent, name) {

  if (parent && !(Directory.is(parent)))
    throw ERR_WRONG_PARENT(parent, ice)

  var node;

  if (ice.nodes) {
    node = Directory(ice.name)
    Object.keys(ice.nodes).map(function (name) {
      node.add(thaw(ice.nodes[name], node, name)); });
  } else if (ice.code) {
    var node = File(ice.name, ice.code);
  } else {
    throw ERR_FOREIGN_BODY(ice, parent, name);
  }

  return node;

}

function ERR_FOREIGN_BODY (ice, parent, name) {
  return Error(
    "can't thaw unknown instance " + name +
    " in frozen glagol tree of " + parent.path + ": " + JSON.stringify(ice))
}
