module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext };

function compileSource () {
  return this.source;
}

function makeContext () {

  var _path = this._sourcePath || this.path;

  var context =
    { exports:       {}
    , __dirname:     require('path').dirname(_path)
    , __filename:    _path
    , console:       console
    , process:       { cwd:      process.cwd
                     , stdin:    process.stdin
                     , stdout:   process.stdout
                     , stderr:   process.stderr
                     , exit:     process.exit
                     , argv:     process.argv
                     , versions: process.versions}
    , setTimeout:    setTimeout
    , clearTimeout:  clearTimeout
    , setInterval:   setInterval
    , clearInterval: clearInterval
    , require:       require('require-like')(_path) };

  return context;

}
