module.exports =
  { compile:  compile
  , evaluate: evaluate
  , globals:  globals
  , target:   "javascript" };

var fs    = require('fs')
  , path  = require('path')
  , vm    = require('vm')
  , xtend = require('xtend');

function compile (file) {
  var source = file.source;

  // strip hashbang line
  if (source[0] === "#") source = source.substring(source.indexOf("\n") + 1);

  return source;
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
    , myRequire = require('require-like')(myPath)
    , context   = vm.createContext(global);

  context.global = context;
  context.__filename = myPath;
  context.__dirname = path.dirname(myPath);
  context.require = myRequire;

  if (file.parent) {
    var tree = require('../core/tree.js')(file);
    context._  = tree;
    context.__ = tree.__;
    context.$  = tree.$;
    context.Glagol = file.parent.root;
  } else {
    context.Glagol = file;
  }

  return context;

}
