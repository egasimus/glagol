module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext };

function compileSource () {
  return require('require-like')(this.path)('stylus').render(this.source);
}

function makeContext (script) {}
