var colors = require('colors/safe')
  , ital   = colors.italic
  , gray   = colors.gray
  , dim    = colors.dim;

module.exports = makeLogger('core');

module.exports.as = makeLogger;

function makeLogger (as) {

  var log = _log.bind(null, false)
  log.error = _log.bind(null, true);

  return log;

  function _log (isError) {
    var red  = isError ? colors.red : function (arg) { return arg }
      , len  = ( ' workspace   ' + as + '  ' ).length
      , tag  = [ red(ital(' workspace '))
               , as ? red(' ' + ital(' ' + as + ' '))
                    : isError ? ' error ' : ''].join('')
      , args = Array.prototype.slice.call(arguments, 1).map(pad);
    args.unshift(tag);
    console.log.apply(console, args);

    function pad (arg) {
      var padding = "\n" + ' '.repeat(len - 2) + red('┇') + ' ';
      return arg.split("\n").join(padding)
    }
  }
}
