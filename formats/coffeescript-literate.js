module.exports =
  { compileSource: compileSource
  , makeContext:   require('./javascript.js').makeContext };

function compileSource () {
  var _path = this._sourcePath || this.path;
  return require('require-like')(_path)('coffee-script').compile(
    this.source, { literate: true });
}
