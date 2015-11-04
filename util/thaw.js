module.exports = thaw;

var glagol = require('..');

function thaw (ice, parent) {

  if (parent && !(parent instanceof glagol.Directory)) {
    throw ERR_WRONG_PARENT(parent, ice)
  }

  if (ice.nodes) {
    return thawDirectory(ice, parent)
  } else if (ice.code) {
    return thawScript(ice, parent)
  } else {
    throw ERR_FOREIGN_BODY(ice);
  }

}

function ERR_WRONG_PARENT (parent, ice) {
  return Error('parent must be instance of Directory')
}

function ERR_FOREIGN_BODY (ice) {
  return Error("can't thaw unknown instance in frozen glagol tree");
}

var path = require('path');

function thawScript (ice, parent) {

  var node = glagol.Script(
    path.join((parent || {}).path || '/', ice.name),
    { thawed: true
    , source: ice.source
    , parent: parent });

  return node;

}

function thawDirectory (ice, parent) {

  var node = glagol.Directory(
    parent ? path.join(parent.path, ice.name) : '/',
    { thawed: true
    , parent: this });

  Object.keys(ice.nodes).map(function (i) {
    node.nodes[i] = thaw(ice.nodes[i]);
  })

  return node;

}
