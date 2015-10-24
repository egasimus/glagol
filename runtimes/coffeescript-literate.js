module.exports =
  { compileSource: compileSource
  , makeContext:   require('./javascript.js').makeContext };

function compileSource () {
  return require('require-like')(this.path)('coffee-script').compile(
    this.source, { literate: true });
}
