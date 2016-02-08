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
    new chokidar.FSWatcher({ persistent: false, atomic: 400, depth: 0 });
  watcher.on('add',       added);
  watcher.on('addDir',    added);
  watcher.on('change',    changed);
  watcher.on('unlink',    removed);
  watcher.on('unlinkDir', removed);

  return load;

  function load (basepath, options) {

    options = options || {};

    return loadNode(basepath);

    function loadNode (location) {

      location = path.resolve(location);
      if (!fs.existsSync(location)) throw ERR_FILE_NOT_FOUND(location);
      if (!_opts.filter(location, basepath)) return null;

      var stat = fs.statSync(location);
      if (stat.isFile()) {
        var node = loadFile(location);
      } else if (stat.isDirectory()) {
        var node = loadDirectory(location);
        watcher.add(location);
      } else {
        throw ERR_UNSUPPORTED(location);
      }

      node._sourcePath = location;
      nodes[location] = node;
      return node;

    }

    function loadDirectory (location) {

      var dirNode = Directory(path.basename(location), options);

      require('glob').sync(path.join(location, "*")).forEach(function (f) {
        var newNode = loadNode(f, options);
        if (newNode) dirNode.add(newNode);
      });

      return dirNode;

    }

    function loadFile (location) {

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

  }

  load.options = _opts;

  function added (f, s) {
    if (nodes[f]) return changed(f, s);

    var node = load(f);
    if (!node) return;

    var parent = nodes[path.dirname(f)];
    if (parent) parent.add(node);

    log("+ added".green, node.constructor.name.toLowerCase().green,
      path.join(parent.path, node.name).bold);
    events.emit('added', node);
  }

  function changed (f, s) {
    var node = nodes[f];
    if (!node) return added(f, s);

    if (_opts.eager && File.is(node)) {
      node.source = fs.readFileSync(f, 'utf8');
    }

    log("* changed".yellow, node.path.bold);
    events.emit('changed', node);
  }

  function removed (f, s) {
    var node = nodes[f];
    if (!node) return;

    var parent = nodes[path.dirname(f)];
    if (parent) parent.remove(node);

    delete nodes[f];

    log("- removed".red, path.join(parent ? parent.path : "", node.name).bold);
    events.emit('removed', node, parent);
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
function defaultFilter (fullpath, basepath) {
  var relpath  = path.relative(basepath, fullpath)
    , basename = path.basename(fullpath);

  var conditions =
    [ relpath.indexOf('node_modules') === -1
    , basename.indexOf('.git') !==0
    , !endsWith(basename, '.swp')
    , !endsWith(basename, '.swo')
    , basename[0] !== '.' ]

  return !conditions.some(function (x) { return !x })
}

function endsWith (x, y) {
  if (x.lastIndexOf(y) < 0) return false;
  return x.lastIndexOf(y) === x.length - y.length;
}
