module.exports = function (from) {
  return function _require (what) {
    return module.exports.require(module.exports.deps[from.slice(1)][what]);
  };
};

module.exports.install = function (deps, require) {
  console.log(deps)
  module.exports.deps    = deps;
  module.exports.require = require;
}
