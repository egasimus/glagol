var fs        = require('fs')
  , path      = require('path')
  , chokidar  = require('chokidar')
  , glob      = require('glob')
  , File      = require('./file.js')
  , Directory = require('./directory.js');

module.exports = Loader;

function Loader () {

  if (this instanceof Loader) return Loader();

  var watcher = new chokidar.FSWatcher({ persistent: false, depth: 0 })
    , nodes   = {}
    , _opts   = { logger: console.log.bind(console)
                , eager:  true };

  watcher.on('add',       added)
  watcher.on('addDir',    added)
  watcher.on('change',    changed)
  watcher.on('unlink',    removed)
  watcher.on('unlinkDir', removed)

  return load;

  function load (basepath, options) {

    options = options || {};

    return _load(basepath);

    function _load (location) {
      location = path.resolve(location);
      if (!fs.existsSync(location)) throw ERR_FILE_NOT_FOUND(path);
      var stat = fs.statSync(location);
      if (stat.isFile()) {
        var node = _loadFile(location);
      } else if (stat.isDirectory()) {
        var node = _loadDirectory(location);
      } else {
        throw ERR_UNSUPPORTED(location);
      }
      watcher.add(node._sourcePath = location);
      return nodes[location] = node;
    }

    function _loadFile (location) {
      var node = File(path.basename(location), options);
      if (_opts.eager) {
        node.source = fs.readFileSync(location, 'utf8');
      } else {
        Object.defineProperty(node, "source",
          { enumerable:   true
          , configurable: true
          , get: function () {
              return this.cache.source
                ? this._cache.source
                : this._cache.source = fs.readFileSync(this._sourcePath, 'utf8');
              }
          , set: function () {
              this._cache.compiled = undefined;
              this._cache.evaluated = false;
              return this._cache.source = v;
            } });
      }
      return node;
    }

    function _loadDirectory (location) {
      var node = Directory(
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

  load.options = _opts;

  function added (f, s) {
    if (!nodes[f]) {
      _opts.logger("added", f);
      nodes[f] = load(f);
    }
  }

  function changed (f, s) {
    if (nodes[f]) {
      _opts.logger("changed", f);
      if (_opts.eager && File.is(nodes[f])) {
        nodes[f].source = fs.readFileSync(f, 'utf8');
      }
    }
  }

  function removed (f, s) {
    if (nodes[f]) {
      _opts.logger("removed", f);
      delete nodes[f].parent.nodes[nodes[f].name];
      delete nodes[f];
    }
  }

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
