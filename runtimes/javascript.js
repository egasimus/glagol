module.exports =
  { compileSource: compileSource
  , makeContext:   makeContext };

var path = require('path');

function compileSource () {
  return this.source;
}

function makeContext () {

  var context =
    { exports:       {}
    , __dirname:     path.dirname(this._filename)
    , __filename:    this._filename
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
    , require:       require('require-like')(this._filename) };

  return context;

}
