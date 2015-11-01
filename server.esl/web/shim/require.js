module.exports = function (from) {
  return function require (what) {
    return module.exports.bundle(module.exports.deps[from.slice(1)][what]);
  };
};

module.exports.install = function (deps, bundle) {
  module.exports.deps = deps;
  module.exports.bundle = eval(
    "(function () { var " + bundle + " return require})()");
}
