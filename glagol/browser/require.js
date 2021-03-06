module.exports = function (from) {
  return function _require (what) {
    return module.exports.require(module.exports.deps[from][what]);
  };
};

module.exports.install = function (deps, require) {
  module.exports.deps    = deps;
  module.exports.require = require;
}
