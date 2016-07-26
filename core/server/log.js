var colors = require('colors/safe');

module.exports = makeLogger('core');

module.exports.as = makeLogger;

function makeLogger (as) {

  var log = _log.bind(null, false)
  log.error = _log.bind(null, true);

  return log;

  function _log (isError) {
    var bold = colors.bold
      , ital = colors.italic
      , red  = isError ? colors.red : function (arg) { return arg }
      , args = Array.prototype.slice.call(arguments, 1)
      , tag  = [ ital(bold(' glagol-workspace '))
               , as ? red(' ' + ital(' ' + as + ' '))
                    : isError ? ' error ' : ''];
    args.unshift(tag.join(''));
    console.log.apply(console, args);
  }
}
