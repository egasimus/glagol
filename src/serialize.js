(function serialize (node) {

  if (!node) return null;

  var ice = {};

  ice.name_ = node.name; // TODO handle in client instead

  if (node.nodes) {
    ice.nodes = {};
    Object.keys(node.nodes).forEach(function (key) {
      ice.nodes[key] = serialize(node.nodes[key])
    })
  }

  if (node.source) {
    ice.source = node.source;
    ice.format = node.format;
    if (node._cache.compiled) ice.compiled = node._cache.compiled;
    if (node._cache.evaluated) ice.value = node._cache.value;
    if (typeof ice.value === 'function') ice.value = serializeFn(ice.value);
  }

  return ice;

  function serializeFn(fn) {
    return 'Function ' + fn.name + " " + fn.length
    //return {type:'Function'}
  }

})
