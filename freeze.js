(function () {

  var glagol = require('glagol');

  return freeze;

  function freeze (node) {

    if (glagol.File.is(node)) {
      return freezeFile(node)
    } else if (glagol.Directory.is(node)) {
      return freezeDirectory(node)
    } else {
      throw ERR_FOREIGN_BODY(node);
    }

  }

  function ERR_FOREIGN_BODY (node) {
    return Error("can't freeze unknown instance in glagol tree");
  }

  function freezeFile (file) {

    var ice =
      { name: file.name
      , time: String(Date.now())
      , code: file.compiled };

    return ice;

  }

  function freezeDirectory (dir) {

    var ice =
      { name:  dir.name
      , time:  String(Date.now())
      , nodes: {} };

    Object.keys(dir.nodes).map(function freezeNode (k) {
      ice.nodes[k] = freeze(dir.nodes[k]);
    }, this);

    return ice;

  }

})()
