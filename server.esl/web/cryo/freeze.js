(function () {

  var glagol = require('glagol');

  return freeze;

  function freeze (node) {

    if (_isDir(node)) {
      return freezeDirectory.call(node)
    } else if (_isScript(node)) {
      return freezeScript.call(node)
    } else {
      throw ERR_FOREIGN_BODY(node);
    }

  }

  function _isDir (node) {
    return (node instanceof glagol.Directory
      || (node._glagol instanceof Object && node._glagol.type === 'Directory'))
  }

  function _isScript (node) {
    return (node instanceof glagol.Script
      || (node._glagol instanceof Object && node._glagol.type === 'Script'))
  }

  function ERR_FOREIGN_BODY (node) {
    return Error("can't freeze unknown instance in glagol tree");
  }

  function freezeScript () {

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
