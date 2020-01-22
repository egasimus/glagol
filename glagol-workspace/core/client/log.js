module.exports = makeLogger('core');

module.exports.as = makeLogger;

function makeLogger (as) {
  return function log () {
    var bold = require('colors/safe').bold
      , ital = require('colors/safe').italic
      , args = Array.prototype.slice.call(arguments, 0)
      , tag  = ital(bold(' glagol-workspace ')) + (as ? (' ' + ital(' ' + as + ' ')) : '');
    args.unshift(tag);
    console.log.apply(console, args);
  }
}
