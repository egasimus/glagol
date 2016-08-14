module.exports = function (hook, unhook) {
  return require('virtual-hook')(
    { hook:   function (el) { setTimeout(function () { hook(el) }, 0) }
    , unhook: unhook }); }
