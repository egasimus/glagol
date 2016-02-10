module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext };

function compileSource () {
  return this.source.replace(/\n$/, "");
}

function makeContext () {}
