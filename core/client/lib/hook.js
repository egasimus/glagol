module.exports = function (hook, unhook) {
  return require('virtual-hook')({ hook: hook, unhook: unhook });
}
