(function serialize (node) {

  if (!node) return null;

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
    if (node._cache.compiled) obj.compiled = node._cache.compiled;
    if (node._cache.evaluated) obj.value = node._cache.value;
  }

  return obj;

})
