module.exports =
  { compile:  compile
  , evaluate: evaluate
  , globals:  globals };

var fs    = require('fs')
  , path  = require('path')
  , vm    = require('vm')
  , xtend = require('xtend');

function compile (file) {
  return file.source;
}

function evaluate (file, context) {
  var context = context || this.globals(file)
    , source  = "(function(){return " + file.compiled + "})()"
    , options = { filename: file._sourcePath || file.path }
    , result  = vm.runInContext(source, context, options);
  if (context.error) throw context.error;
  if (context.hasOwnProperty('exports')) return context.exports;
  return result;
}

function globals (file) {

  var myPath    = file._sourcePath || file.path
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

  if (file.parent) {
    var tree = require('../core/tree.js')(file);
    context._  = tree;
    context.__ = tree.__;
    context.$  = tree.$;
    context.Glagol = file.parent.root;
  } else {
    context.Glagol = file;
  }

  return vm.createContext(context);

}
