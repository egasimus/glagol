var fs        = require('fs')
  , path      = require('path')
  , chokidar  = require('chokidar')
  , glob      = require('glob')
  , colors    = require('colors')
  , File      = require('./file.js')
  , Directory = require('./directory.js');

module.exports = Loader;

function Loader () {

  if (this instanceof Loader) return Loader();

  var nodes = load._nodes = {}
    , _opts = { logger: defaultLogger
              , filter: defaultFilter
              , eager:  true };

  function log () {
    if (_opts.logger) _opts.logger(arguments);
  }

  var events = load.events =
    new (require('eventemitter3'))();
  var watcher = load._watcher =
    new chokidar.FSWatcher({ persistent: false, atomic: true, depth: 0 });
  watcher.on('add',       added);
  watcher.on('addDir',    added);
  watcher.on('change',    changed);
  watcher.on('unlink',    removed);
  watcher.on('unlinkDir', removed);

  return load;

  function load (basepath, options) {

    options = options || {};

    return _load(basepath);

    function _load (location) {

      location = path.resolve(location);
      if (!fs.existsSync(location)) throw ERR_FILE_NOT_FOUND(location);

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

      var node = nodes[location] || File(path.basename(location), options);

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
          , set: function (v) {
              this._cache.compiled = undefined;
              this._cache.evaluated = false;
              return this._cache.source = v;
            } });
      }

      return node;

    }

    function _loadDirectory (location) {

      var node = Directory(path.basename(location),  options);

      require('glob').sync(path.join(location, "*")).filter(_opts.filter)
        .forEach(function (f) { node.add(_load(f, options)); });

      return node;

    }

  }

  load.options = _opts;

  function added (f, s) {
    if (_opts.filter(f) && !nodes[f]) {
      var node   = nodes[f] = load(f)
        , parent = nodes[path.dirname(f)];
      nodes[path.dirname(f)].add(node);
      log("+ added".green, node.constructor.name, node.name.bold,
        "into", parent.path.bold);
      events.emit('added', node);
    }
  }

  function changed (f, s) {
    var node = nodes[f];
    if (_opts.filter(f) && node) {
      log("* changed".yellow, node.path.bold);
      if (_opts.eager && File.is(node)) {
        node.source = fs.readFileSync(f, 'utf8');
      }
      events.emit('changed', node);
    }
  }

  function removed (f, s) {
    if (nodes[f]) {
      var node   = nodes[f]
        , parent = nodes[path.dirname(f)];
      log("- removed".red, node.name.bold,
        parent ? "from " + parent.path.bold : "");
      delete node.parent.nodes[node.name];
      delete node;
    }
  }

}

function ERR_FILE_NOT_FOUND (location) {
  return Error("file not found: " + location);
}

Loader.defaultLogger = defaultLogger;
function defaultLogger (args) {
  console.log.apply(console, args);
}

Loader.defaultFilter = defaultFilter;
function defaultFilter (f) {
  var conditions =
    [ f.indexOf('node_modules') === -1
    , f.indexOf('.git')         === -1
    , f.lastIndexOf('.swp')      <  f.length - 4
    , f.lastIndexOf('.swo')      <  f.length - 4
    , path.basename(f)[0]       !== '.' ]
  return !conditions.some(function (x) { return !x })
}
