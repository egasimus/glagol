module.exports =
  { compileSource: compileSource
  , makeContext:   require('./javascript.js').makeContext };

function compileSource (source, opts) {
  return require('require-like')(opts.path)('coffee-script').compile(
    source, { literate: true });
}
