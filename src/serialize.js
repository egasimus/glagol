(function serialize (node) {

  var obj = {};

  obj.name_ = node.name;

  if (node.nodes) {
    obj.nodes = {};
    Object.keys(node.nodes).forEach(function (key) {
      obj.nodes[key] = serialize(node.nodes[key])
    })
  }

  if (node.source) {
    obj.source = node.source;
  }

  return obj;

})
