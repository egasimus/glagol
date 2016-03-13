var path = require('path');


module.exports.printFile = function printFile (location, state) {
  console.log(
    Array(state.depth).join('│ ') +
    (state.last ? '└' : '├') +
    "╴" + path.basename(state.linkPath || location) +
    (state.linkPath ? " -> " + state.linkPath : ""))
}

module.exports.printDirectory = function printDirectory (location, state) {
  console.log(
    Array(state.depth - 1).join('│ ') +
    (state.last ? '└' : '├') +
    "╴" + path.basename(state.linkPath || location) +
    (state.linkPath ? (" -> " + state.linkPath).white : ""))
}

module.exports.printIgnored = function printIgnored (f, state, i, a) {
  console.log(
    Array(state.depth).join('│ ') +
    (i === a.length - 1 ? '└' : '├') +
    "╴" + path.basename(f).gray, "X".red);
}

module.exports.endsWith = function endsWith (x, y) {
  if (x.lastIndexOf(y) < 0) return false;
  return x.lastIndexOf(y) === x.length - y.length;
}
