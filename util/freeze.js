(function () {

  var File      = require('glagol/core/file')
    , Directory = require('glagol/core/directory')

  return function freeze (node) {

    if (File.is(node)) {
      return node.compiled || "";
    } else if (Directory.is(node)) {
      var ice = {};
      Object.keys(node.nodes).forEach(function (name) {
        ice[name] = freeze(node.nodes[name]);
      })
      return ice;
    } else {
      throw Error("can't freeze unknown instance in glagol tree");
    }

  }

})()
