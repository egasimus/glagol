var fs        = require('fs')
  , path      = require('path')
  , chokidar  = require('chokidar')
  , glob      = require('glob')
  , colors    = require('colors')
  , File      = require('./file.js')
  , Directory = require('./directory.js');

module.exports = Loader;

function Loader () {

  // the Loader is styled like a class even though it really isn't.
  // let's ignore the `new` keyword for consistency with other primitives.
  if (this instanceof Loader) return Loader();

  // global loader options
  load.logger = defaultLogger;
  load.filter = defaultFilter;
  load.eager = true; // TODO

  // log if there's a logger set; assumes it's callable
  function log () {
    if (load.logger) load.logger(arguments);
  }

  // event emitter; TODO
  var events = load.events = new (require('eventemitter3'))();

  // loaded files, directories, etc (henceforth: nodes) are stored here
  var nodes = {}

  // a single watcher keeps track of all nodes. its `depth` options is
  // set to 0 since directories are manually added to it during loading.
  var watcher = load._watcher =
    new chokidar.FSWatcher({ persistent: false, atomic: 400, depth: 0 });
  watcher.on('add',       added);
  watcher.on('addDir',    added);
  watcher.on('change',    changed);
  watcher.on('unlink',    removed);
  watcher.on('unlinkDir', removed);

  return load;

  function load (rootpath, options) {

    // use absolute path of requested starting location
    rootpath = path.resolve(rootpath);

    // deduplicate: if this path has already been loaded
    // (as a result of having loaded some parent directory)
    // return the already loaded object
    if (nodes[rootpath]) return nodes[rootpath];

    // no defaults to extend
    options = options || {};

    // load node at rootpath.
    // if it's a directory, its contents are recursively loaded.
    // having passed the deduplication check above, we can assume
    // that this node is so far completely unknown to this loader.
    console.log("load", rootpath)
    return loadNode(rootpath);

    function loadNode (location, first) {
      // use absolute path of this node
      location = path.resolve(location);

      // missing nodes throw an error, ignored ones just return null
      if (!fs.existsSync(location)) throw ERR_FILE_NOT_FOUND(location);
      if (!_opts.filter(location, rootpath)) return null;

      // get info about the filesystem node
      var stat = fs.statSync(location);

      // the initial loading pass is done synchronously; can't wait for
      // the watcher to detect and add files when we add directories to it.
      // TODO: if possible, meaningfully integrate other Unix file types:
      //       link, socket, fifo, block device, character device
      if (stat.isFile()) {
        var node = loadFile(location);
      } else if (stat.isDirectory()) {
        var node = loadDirectory(location);
        watcher.add(location);
      } else {
        throw ERR_UNSUPPORTED(location);
      }

      // the JS object that we just created to represent a filesystem node
      // is made aware of the filesystem path that corresponds to it, and is
      // stored into the loader's node cache.
      node._sourcePath = location;
      nodes[location] = node;

      // and we're done.
      return node;
    }

    function loadDirectory (location) {
      // load a directory if not already loaded
      var dirNode = nodes[location] || Directory(path.basename(location), options);

      // recursively load its children
      require('glob').sync(path.join(location, "*")).forEach(function (f) {
        var newNode = loadNode(f, options);
        if (newNode) dirNode.add(newNode);
      });

      return dirNode;
    }

    function loadFile (location) {

      // load a file if not already loaded
      var node = nodes[location] || File(path.basename(location), options);

      if (_opts.eager) {

        // synchronously read original file contents from filesystem
        node.source = fs.readFileSync(location, 'utf8');

      } else {

        // TODO review code for lazy/eager modes
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

    function added (f, s) {
      if (nodes[f]) return changed(f, s);

      var node = loadNode(f);
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

    function isChildOf (root, location) {
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
function defaultFilter (fullpath, rootpath) {
  var relpath  = path.relative(rootpath, fullpath)
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
