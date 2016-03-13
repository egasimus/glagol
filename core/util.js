var path = require('path');

module.exports =
  { printFile: printFile
  , printDirectory: printDirectory
  , printIgnored: printIgnored
  , printTreeNode: printTreeNode
  , endsWith: endsWith }

function printFile (location, state) {
  printTreeNode(state.depth + 1, state.last, false,
    path.basename(state.linkPath || location) +
    (state.linkPath ? " -> " + state.linkPath : ""))
}

function printDirectory (location, state) {
  printTreeNode(state.depth, state.last, true,
    path.basename(state.linkPath || location) + '/' +
    (state.linkPath ? (" -> " + state.linkPath).gray : ""))
}

function printIgnored (f, state, i, a) {
  printTreeNode(state.depth + 1, i === a.length - 1, false,
    path.basename(f).gray + ' ' + 'X'.red)
}

function printTreeNode (depth, last, dir, name) {
  //var chars = printTreeNode._treeCharacters;
  console.log(
    '┇ '.gray + Array(depth).join(chars[0] + ' ') +
    name);
}

//printTreeNode._treeCharacters = [ '│', '┕', '└', '┝', '├', '╸' , '╴'].map(function (c) { return " " })

function endsWith (x, y) {
  if (x.lastIndexOf(y) < 0) return false;
  return x.lastIndexOf(y) === x.length - y.length;
}
