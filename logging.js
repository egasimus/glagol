var colors = require('colors/safe');

var getLogger = exports.getLogger = function getLogger (from) {
  return function logger () {
    var args    = []
      , output  = ""
      , newline = false;

    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    output = args.join(" ");

    if (output[0] === "\n") {
      output = output.substr(1);
      newline = true
    }

    console.log((newline ? "\n" : "") + colors.yellow(from), output);
  }
}
