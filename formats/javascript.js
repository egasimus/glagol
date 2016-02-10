module.exports =
  { compile: compile
  , globals: globals };

function compile () {
  return this.source;
}

var fs   = require('fs')
  , path = require('path');

function globals () {

  var myPath    = this._sourcePath || this.path
    , myRequire = require('require-like')(myPath);

  var context =
    { __dirname:
        require('path').dirname(myPath)
    , __filename:
        myPath
    , console:
        console
    , process:
        { cwd:      process.cwd
        , stdin:    process.stdin
        , stdout:   process.stdout
        , stderr:   process.stderr
        , exit:     process.exit
        , argv:     process.argv
        , versions: process.versions}
    , setTimeout:
        setTimeout
    , clearTimeout:
        clearTimeout
    , setInterval:
        setInterval
    , clearInterval:
        clearInterval
    , require:
        myRequire
    };

  return context;

}
