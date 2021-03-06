(function () {

  var File      = require('glagol/core/file')
    , Directory = require('glagol/core/directory')
    , error     = require('glagol/core/error')

  return function freeze (node, parent) {

    if (File.is(node)) {
      if (node._mountTarget) return freeze(node._mountTarget);
      return node.compiled || "";
    } else if (Directory.is(node)) {
      var ice = {};
      Object.keys(node.nodes).forEach(function (name) {
        ice[name] = freeze(node.nodes[name], node);
      })
      return ice;
    } else {
      throw error.FOREIGN_BODY(node, parent);
    }

  }

})()
