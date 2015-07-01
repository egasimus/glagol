var colors = require('colors/safe')
  , pretty = require('prettyjson');

var getLogger = exports.getLogger = function getLogger (from) {
  return function logger () {
    var args    = []
      , output  = ""
      , newline = false;

    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (typeof arg === 'object') {
        if (i === 0) args.push("\n");
        args.push(pretty.render(filterObject(arg)));
        if (i < arguments.length - 1) args.push("\n");
      } else {
        args.push(typeof arg === 'undefined' ? '<undefined>' : arg);
        args.push(" ");
      }
    }

    output = args.join("");

    if (typeof arguments[0] === 'string' && arguments[0][0] === "\n") {
      output = output.substr(1);
      newline = true
    }

    console.log((newline ? "\n" : "") + colors.yellow(from), output);
  }
}

var filterObject = exports.filterObject = function filterObject (obj) {
  var cache = [];
  return JSON.parse(JSON.stringify(obj, jsonFilter));
  function jsonFilter (key, value) {
    if (typeof value === 'function') {
      return "<function>";
    }
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) return "<circular>";
      cache.push(value);
    }
    return value;
  }
}
