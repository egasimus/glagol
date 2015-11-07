var fs        = require('fs')
  , path      = require('path')
  , File      = require('./file.js')
  , Directory = require('./directory.js');

var watcher = new (require('chokidar').FSWatcher)(
      { persistent: false, depth: 0 })
  , nodes = {};

watcher.on('add',       added)
watcher.on('addDir',    added)
watcher.on('change',    changed)
watcher.on('unlink',    removed)
watcher.on('unlinkDir', removed)

module.exports = load;

function load (basepath, options) {

  return _load(basepath);

  function _load (location) {
    if (!fs.existsSync(location)) throw ERR_FILE_NOT_FOUND(path);
    var stat = fs.statSync(location);
    if (stat.isFile()) {
      var node = _loadFile(location);
    } else if (stat.isDirectory()) {
      var node = _loadDirectory(location);
    } else {
      throw ERR_UNSUPPORTED(location);
    }
    watcher.add(location);
    return node;
  }

  function _loadFile (location) {
    var node = nodes[location] = File(path.basename(location), options);
    node.source = fs.readFileSync(location, 'utf8');
    return node;
  }

  function _loadDirectory (location) {
    var node = nodes[location] = Directory(
      path.basename(path.relative(basepath, location) || "/"),
      options);
    require('glob').sync(path.join(location, "*"))
      .filter(function (f) {
        return -1 === f.indexOf('node_modules')
      }).map(function (f) {
        var node2 = _load(f, options)
        node2.parent = node;
        node.nodes[node2.name] = node2;
      })
    return node;
  }

};

function added (f, s) {
  if (!nodes[f]) console.log("added", f)
}

function changed (f, s) {
  console.log("changed", f)
}

function removed (f, s) {
  if (nodes[f]) console.log("removed", f)
}

function x () {

  this._watcher = require('chokidar').watch(
    this.path, { depth: 0, persistent: false });

  this._watcher.on("change", function (f) {
    this.nodes[path.basename(f)].refresh();
  }.bind(this))

  this._watcher.on("add", function (f) {
    if (-1 === Object.keys(this.nodes).indexOf(path.basename(f))) {
      this.nodes[path.basename(f)] = File(f);
    };
  }.bind(this));

}
