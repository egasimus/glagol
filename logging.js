var colors = require('colors/safe');

var getLogger = exports.getLogger = function getLogger (from) {
  return function logger () {
    var args = [];
    for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
    console.log(colors.yellow(from), args.join(" "));
  }
}
