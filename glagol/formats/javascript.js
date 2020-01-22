module.exports =
  { compile:  compile
  , evaluate: evaluate
  , globals:  globals
  , name:     "JavaScript"
  , target:   "javascript" };

var fs      = require('fs')
  , path    = require('path')
  , Module  = require('module')
  , vm      = require('vm')
  , extend  = require('extend');

// polyfill Module in browserify
if (process.browser) { Module = function Module (id, parent) { this.id = id; } }

function compile (file) {
  var source = file.source;

  // strip hashbang line
  if (source[0] === "#") source = source.substring(source.indexOf("\n") + 1);

  return source;
}

function evaluate (file, globals) {
  var context = vm.createContext(globals || this.globals(file))
    , source  = file.compiled //"(function(){return " + file.compiled + "})()"
    , options = { filename: file._sourcePath || file.path, displayErrors: true }
    , result  = vm.runInContext(source, context, options);
  if (context.error) throw context.error;
  if (context.hasOwnProperty('exports')) return context.exports;
  return result;
}

function globals (file) {

  var context = process.browser ? {} : extend({}, global);
  context.global = process.browser ? global : context;
  context.Glagol = file;
  context.__filename = file._sourcePath || file.path;
  context.__dirname = path.dirname(context.__filename);

  context.module = new Module(context.__filename);
  context.module.filename = context.module.id;
  context.module.loaded = true;
  Object.defineProperty(context.module, "exports",
    { enumerable: true
    , configurable: true
    , get: function ()  { return context.exports }
    , set: function (v) { return context.exports = v; }});

  var localRequire = require('require-like')(context.__filename);

  if (file.parent) {

    context.require = function require (what) {
      if (what[0] === '.' || what[0] === '/') {
        var node = file.parent.get(what);
        if (node) return node();
      }
      return localRequire(what);
    };

    if (file.options.shorthands) {
      var tree = file.parent();
      context._ = tree;
      context.__ = tree.__;
      context.$ = tree.$;
    }

  } else {

    context.require = localRequire;

  }

  var extra = file.options.globals;
  extend(context, extra instanceof Function ? extra(file) : extra);

  return context;

}
