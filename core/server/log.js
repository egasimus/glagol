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
      , gray = colors.gray
      , red  = isError ? colors.red : function (arg) { return arg }
      , len  = ( ' workspace   ' + as + '  ' ).length
      , tag  = [ ital(bold(' workspace '))
               , as ? red(' ' + ital(' ' + as + ' '))
                    : isError ? ' error ' : ''].join('')
      , args = Array.prototype.slice.call(arguments, 1).map(pad);
    args.unshift(tag);
    console.log.apply(console, args);

    function pad (arg) {
      var padding = "\n" + ' '.repeat(len - 2) + (isError?red:gray)('┇') + ' ';
      return arg.split("\n").join(padding)
    }
  }
}
