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
    path.basename(state.linkPath || location) +
    (state.linkPath ? (" -> " + state.linkPath).gray : ""))
}

function printIgnored (f, state, i, a) {
  printTreeNode(state.depth + 1, i === a.length - 1, false,
    path.basename(f).gray + ' ' + 'X'.red)
}

function printTreeNode (depth, last, dir, name) {
  var chars = printTreeNode._treeCharacters;
  console.log(
    Array(depth).join(chars[0] + ' ') + 
    (last ? (dir ? chars[1] : chars[2]) : (dir ? chars[3] : chars[4])) +
    (dir ? chars[5] : chars[6]) +
    name);
}

printTreeNode._treeCharacters = [ '│', '┕', '└', '┝', '├', '╸' , '╴']

function endsWith (x, y) {
  if (x.lastIndexOf(y) < 0) return false;
  return x.lastIndexOf(y) === x.length - y.length;
}
