var path = require('path');

module.exports =
  { printFile: printFile
  , printDirectory: printDirectory
  , printIgnored: printIgnored
  , printTreeNode: printTreeNode
  , endsWith: endsWith 
  , homedir: homedir}

function printFile (location, state) {
  printTreeNode(state.depth + 1, false,
    path.basename(state.linkPath || location) +
    (state.linkPath ? " -> " + homedir(location) : "")) }

function printDirectory (location, state) {
  printTreeNode(state.depth, true,
    path.basename(state.linkPath || location).bold + '/' +
    (state.linkPath ? (" -> " + homedir(location)).gray : "")) }

function printIgnored (f, state, i, a) {
  printTreeNode(state.depth + 1, false,
    path.basename(f).gray + ' ' + 'X'.red +
    (state.linkPath ? (" -> " + homedir(location)).gray : "")) }

function printTreeNode (depth, dir, name) {
  //var chars = printTreeNode._treeCharacters;
  console.log(
    '       ┇   '.gray + Array(depth).join('  ') +
    name); }

//printTreeNode._treeCharacters = [ '│', '┕', '└', '┝', '├', '╸' , '╴'].map(function (c) { return " " })

function endsWith (x, y) {
  x = x || '';
  y = y || '';
  if (x.lastIndexOf(y) < 0) return false;
  return x.lastIndexOf(y) === x.length - y.length;
}

function homedir (x) {
  var regexp = new RegExp("^" + require('os').homedir());
  return x.replace(regexp, "~");
}
