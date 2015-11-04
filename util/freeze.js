module.exports = freeze;

var glagol = require('..');

function freeze (node) {

  if (node instanceof glagol.Directory) {
    return freezeDirectory.call(node)
  } else if (node instanceof glagol.Script) {
    return freezeScript.call(node)
  } else {
    throw ERR_FOREIGN_BODY(node);
  }

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
    frozen.nodes[k] = freeze(node);
  }, this);

  return ice;

}
