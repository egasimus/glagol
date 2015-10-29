var path = require('path')
  , fs   = require('fs');

var Script = require('../core/script.js');

var Directory = module.exports = function Directory () {

  var pathname, options;
  if (arguments[0] && typeof arguments[0] === 'object') {
    pathname = null;
    options  = arguments[0];
  } else {
    pathname = arguments[0] || '';
    options  = arguments[1] || {};
  }

  // enforce usage of `new` keyword even if omitted
  if (!(this instanceof Directory)) return new Directory(pathname, options);

  this.type    = "Directory";
  this.path    = pathname || null;
  this.name    = pathname ? path.basename(pathname) : null;
  this.nodes   = {};
  this.options = options;

  if (this.options.thaw) {
    this.name = this.options.thaw.name;
    Object.keys(this.options.thaw.nodes).map(function (k) {
      var node = this.options.thaw.nodes[k];
      if (node.nodes) {
        this.nodes[k] = Directory(
          { thaw:    node
          , runtime: this.options.runtime })
      } else if (node.code) {
        this.nodes[k] = Script(node.name,
          { source:  node.code
          , runtime: this.options.runtime })
      }
    }, this);
  } else if (this.path && fs.existsSync(this.path)) {
    this._load("*", { nodir: true }, Script);
    this._load(path.join("*", path.sep), {}, Directory);
    if (!options.nowatch) this._watch();
  }

}

Directory.prototype._load = function (rel, globOptions, type) {

  require('glob').sync(path.join(this.path, rel), globOptions)
    .filter(function (f) {
      return -1 === f.indexOf('node_modules');
    }).map(function (f) {
      var s = type(f, this.options);
      s.parent = this;
      this.nodes[s.name] = s;
    }, this);

}

Directory.prototype._watch = function () {

  this._watcher = require('chokidar').watch(
    this.path, { depth: 0, persistent: false });

  this._watcher.on("change", function (f) {
    this.nodes[path.basename(f)].refresh();
  }.bind(this))

  this._watcher.on("add", function (f) {
    if (-1 === Object.keys(this.nodes).indexOf(path.basename(f))) {
      this.nodes[path.basename(f)] = Script(f);
    };
  }.bind(this));

}

Directory.prototype.tree = function () {

  return require('./tree.js')(this);

}

Directory.prototype.descend = function (relPath) {

  var node  = this,
      steps = relPath.split("/");

  for (var i = 0; i < steps.length; i++) {

    var step = steps[i];

    if (-1 === Object.keys(node.nodes).indexOf(step)) {
      ERR_BROKEN_PATH(step, relPath);
    }

    node = node.nodes[step];

    if (i < steps.length - 1 && node.type !== "Directory") {
      ERR_REACHED_FILE(step, relPath);
    }
  }

  return node;

}

function ERR_BROKEN_PATH(step, path) {
  throw Error("Missing step " + step + " in path " + path);
}

function ERR_REACHED_FILE(step, path) {
  throw Error("Step " + step + " in path " + path + " is a file");
}

Directory.prototype.freeze = function () {

  var frozen =
    { name:  this.name
    , time:  String(Date.now()) 
    , nodes: {} };

  Object.keys(this.nodes).map(freezeNode, this);

  function freezeNode (k) {
    frozen.nodes[k] = this.nodes[k].freeze();
  }

  return frozen;

}
