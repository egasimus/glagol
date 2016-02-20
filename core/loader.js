var fs        = require('fs')
  , path      = require('path')
  , chokidar  = require('chokidar')
  , glob      = require('glob')
  , colors    = require('colors')
  , xtend     = require('xtend')
  , File      = require('./file')
  , Directory = require('./directory')
  , error     = require('./error');

module.exports = Loader;

function Loader (baseOptions) {

  if (this instanceof Loader) throw err.NOT_A_CONSTRUCTOR('glagol.Loader');

  // global loader options
  baseOptions = baseOptions || {};
  load.options = xtend(
    { filter:  Loader.defaults.filter
    , reader:  Loader.defaults.reader
    , eager:   true }, baseOptions);
  load.options.formats = xtend(
    require('../formats/index.js'), baseOptions.formats);

  // events and logging
  load.events = new (require('eventemitter3'))();
  load.events.on('added',   Loader.defaults.log.added);
  load.events.on('changed', Loader.defaults.log.changed);
  load.events.on('removed', Loader.defaults.log.removed);

  // glagol objects corresponding to loaded filesystem nodes
  // (files, directories, etc.; henceforth: nodes) are stored here
  var nodes = {};

  // a single watcher keeps track of all loaded nodes. its `depth` option
  // is set to 0, since directories are manually added to it during loading.
  var watcher = load.watcher =
    new chokidar.FSWatcher({ persistent: false, atomic: 400, depth: 0 });

  return load;

  function load (rootpath, _options) {

    // use absolute path of requested starting location
    rootpath = path.resolve(rootpath);

    // deduplicate: if this path has already been loaded
    // (as a result of having loaded some parent directory)
    // return the object that corresponds to it
    if (nodes[rootpath]) return nodes[rootpath];

    // extend loader defaults with any user overrides for this load operation
    _options = _options || {};
    var options = require('xtend')(load.options, _options);
    options.formats = require('xtend')(load.options.formats, _options.formats);

    // bind watcher callbacks for this root path
    // these keep track of changes to the actual files
    watcher.on('add',       added);
    watcher.on('addDir',    added);
    watcher.on('change',    changed);
    watcher.on('unlink',    removed);
    watcher.on('unlinkDir', removed);

    // load node at `rootpath`.
    // if it's a directory, its contents are recursively loaded.
    // having passed the deduplication check above, we can assume
    // that this node is so far completely unknown to this loader.
    return loadNode(rootpath);

    function loadNode (location) {
      // use absolute path of this node
      location = path.resolve(location);

      // missing nodes throw an error, ignored ones just return null
      if (!fs.existsSync(location)) throw error.FILE_NOT_FOUND(location);
      if (!options.filter(location, rootpath)) return null;

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
        throw error.LOADER_UNSUPPORTED(location);
      }

      // the JS object that we just created to represent a filesystem node
      // is made aware of the filesystem path that corresponds to it, and is
      // stored into the loader's node cache.
      node._sourcePath = location;
      node._rootPath = rootpath;
      nodes[location] = node;

      // the `_justLoaded` attribute is used once then deleted immediately
      // afterwards. it makes sure that the first `added` event emitted by
      // the watcher, having found the node already loaded, and thus having
      // turned into a `changed` event (see below), displays as an add event
      // nonetheless.
      node._justLoaded = true;

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

      if (options.eager) {

        // in eager mode, file contents are synchronously read from
        // the filesystem as soon as the File node is created (i.e. now:)
        node.source = options.reader(location);

      } else {

        // in non-eager mode, the node's `source` property is redefined
        // to read the file's contents the first time it is accessed, and
        // store them in the File object's local cache.
        Object.defineProperty(node, "source",
          { enumerable:   true
          , configurable: true
          , get: function () {
              return this.cache.source
                ? this._cache.source
                : this._cache.source = options.reader(location);
              }.bind(node)
          , set: function (v) {
              this._cache.compiled = undefined;
              this._cache.evaluated = false;
              return this._cache.source = v;
            }.bind(node) });

      }

      return node;
    }

    // watcher callbacks
    // since they are added once for each `load` call that does not return
    // an already loaded object, the `isChildOf` function is used to filter
    // out all the irrelevant events and run only the right one.

    function added (f, s) {
      if (!isChildOf(rootpath, f)) return;

      // normalize possible flukes: if an object already exists in memory
      // for this path, then this should be a change event
      if (nodes[f]) return changed(f, s);

      // load newly created node into glagol -- unless it's filtered out.
      var node = loadNode(f);
      if (!node) return;

      // if the node's parent directory is already known to this loader,
      // add the child node to its parent.
      var parent = nodes[path.dirname(f)];
      if (parent) parent.add(node);

      load.events.emit('added', node);
    }

    function changed (f, s) {
      if (!isChildOf(rootpath, f)) return;

      var node = nodes[f];

      // normalize possible flukes: if no object exists in memory for this
      // path, then this should be an add event
      if (!node) return added(f, s);

      // in non-eager mode, source is only reloaded on demand
      // and there's nothing we need to do right now
      if (options.eager && File.is(node)) {
        node.source = options.reader(f);
      }

      if (node._justLoaded) {
        delete node._justLoaded;
        load.events.emit('added', node);
      } else {
        load.events.emit('changed', node);
      }
    }

    function removed (f, s) {
      if (!isChildOf(rootpath, f)) return;

      var node = nodes[f];

      // normalize possible flukes: if an object is already missing from memory,
      // then all is ok really, no need to do anything else to delete it.
      if (!node) return;

      // if parent object exists, renounce deleted child
      var parent = nodes[path.dirname(f)];
      if (parent) parent.remove(node);

      // remove reference to object from this file
      delete nodes[f];

      load.events.emit('removed', node, parent);
    }

    function isChildOf (currentRoot, location) {
      if (path.parse(currentRoot).root !== path.parse(location).root) {
        // root component of path can be different on windows systems
        // where there is one filesystem per drive; in that case, `location`
        // is certainly not a child of `currentRoot`.
        return false;
      }
      if (path.parse(path.relative(currentRoot, location)).dir[0] === '.') {
        // if the relative path from the node's location to the root under test
        // starts with a dot, then the node is above the root; therefore, it
        // is certainly not a child of that root.
        return false;
      } else {
        // if the node's location is under the `currentRoot` after all, there
        // is still the chance that it has not been loaded from that root
        // because of filters, e.g. (assuming default filter): if there's a
        // `foo/node_modules/bar` in `nodes`, then it's a separate root from
        // `foo`, since anything under `node_modules` is ignored by default
        // and can't have been loaded with the same loader call as `foo`.
        return options.filter(location, currentRoot);
      }
    }

  }

}

Loader.defaults =
  { filter:
      function defaultFilter (fullpath, rootpath) {
        // by default, Glagol's loader ignores a filesystem node if its path matches
        // any of these conditions:
        //   * if its path (relative to loader root) contains `node_modules`
        //     (so that the potentially thousands of files belonging to libraries
        //     installed there are not watched; use `require('...')` to load them;
        //     check uses relative path so that any Glagol-aware libraries in
        //     `node_modules` can use the same loader without their files being
        //     ignored)
        //   * filename starts with `.git`; the contents of Git's history dir and
        //     `.gitignore`/`.gitkeep` files have little relevance to the workings
        //     of the program managed by Glagol.
        //   * filename ends with `.swp` or `.swo`, a.k.a. Vim tempfiles
        //   * also, any other dotfiles (making the `.git` check a bit redundant

        var relpath  = path.relative(rootpath, fullpath)
          , basename = path.basename(fullpath);

        var conditions =
          [ relpath.indexOf('node_modules') < 0
          , basename.indexOf('.git') !== 0
          , !endsWith(basename, '.swp')
          , !endsWith(basename, '.swo')
          , basename[0] !== '.' ];

        function endsWith (x, y) {
          if (x.lastIndexOf(y) < 0) return false;
          return x.lastIndexOf(y) === x.length - y.length;
        }

        return !conditions.some(function (x) { return !x; }); }

  , reader:
      function defaultReader (location) {
        return fs.readFileSync(location, 'utf8'); }

  , log:
      { added:
          function logAddition (node) {
            var regexp = new RegExp("^" + require('os').homedir());
            console.log("+ added".green,
              node._glagol.type.toLowerCase().green,
              node._rootPath.replace(regexp, "~").black + node.path.bold); }

      , changed:
          function logChange (node) {
            console.log("* changed".yellow,
              node.path.bold); }

      , removed:
          function logRemoval (node, parent) {
            console.log("- removed".red,
              path.join(parent ? parent.path : "", node.name).bold); } } };
