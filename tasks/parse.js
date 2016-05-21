var options = { extraTransformMacros:
  [ require('eslisp-dotify')
  , require('eslisp-camelify')
  , require('eslisp-propertify') ] };

module.exports = require('glagol-eslisp')(options);

var globals = module.exports.globals;
module.exports.globals = function () {
  return require('extend')(globals.apply(null, arguments),
    module.exports._extraGlobals);
}

module.exports.name = 'Glagol Supervisor Task (Eslisp)'

module.exports._extraGlobals = 

  { service:
    function () {
      var args = Array.prototype.slice.call(arguments, 0)
        , task = {};
      if (typeof args[0] === 'string') task.name = args.shift();
      args.forEach(function(arg) { arg(task) });
      return task;
    }

  , description:
    function (text) {
      return function (task) {
        task.description = text;
      }
    }

  , process:
    function (executable) {
      return function (task) {
        task.processes = task.processes || [];
        task.processes.push(executable);
      }
    }

  }

