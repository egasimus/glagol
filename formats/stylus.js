module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext };

function compileSource () {
  var _path = this._sourcePath || this.path;
  return require('require-like')(_path)('stylus').render(this.source);
}

function makeContext () {}
