(function () {

  var glagol = require('glagol');

  return freeze;

  function freeze (node) {

    if (_isDir(node)) {
      return freezeDirectory.call(node)
    } else if (_isFile(node)) {
      return freezeFile.call(node)
    } else {
      throw ERR_FOREIGN_BODY(node);
    }

  }

  function _isDir (node) {
    return (node instanceof glagol.Directory
      || (node._glagol instanceof Object && node._glagol.type === 'Directory'))
  }

  function _isFile (node) {
    return (node instanceof glagol.File
      || (node._glagol instanceof Object && node._glagol.type === 'File'))
  }

  function ERR_FOREIGN_BODY (node) {
    return Error("can't freeze unknown instance in glagol tree");
  }

  function freezeFile () {

    var ice =
      { name: this.name
      , time: String(Date.now())
      , code: this.compiled };

    return ice;

  }

  function freezeDirectory () {

    var ice =
      { name:  this.name
      , time:  String(Date.now())
      , nodes: {} };

    Object.keys(this.nodes).map(function freezeNode (k) {
      ice.nodes[k] = freeze(this.nodes[k]);
    }, this);

    return ice;

  }

})()
