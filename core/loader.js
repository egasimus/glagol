var fs        = require('fs')
  , path      = require('path')
  , chokidar  = require('chokidar')
  , glob      = require('glob')
  , colors    = require('colors')
  , extend    = require('extend')
  , EE2       = require('eventemitter2').EventEmitter2
  , File      = require('./file')
  , Directory = require('./directory')
  , Link      = require('./link')
  , error     = require('./error');

module.exports = Loader;

function Loader (baseOptions) {

  if (this instanceof Loader) throw err.NOT_A_CONSTRUCTOR('glagol.Loader');

  // global loader options
  baseOptions = baseOptions || {};
  load.options = extend(true,
    { filter:     Loader.defaults.filter
    , reader:     Loader.defaults.reader
    , log:        true
    , eager:      true
    , shorthands: true
    , formats:    require('../formats/index.js') }, baseOptions);

  // events and logging
  load.events = new EE2({ maxListeners: 0 });
  if (load.options.log) {
    load.events.on('added',   Loader.defaults.log.added);
    load.events.on('changed', Loader.defaults.log.changed);
    load.events.on('removed', Loader.defaults.log.removed);
  }

  // glagol objects corresponding to loaded filesystem nodes
  // (files, directories, etc.; henceforth: nodes) are stored here
  var nodes = {};

  // a single watcher keeps track of all loaded nodes. its `depth` option
  // is set to 0, since directories are manually added to it during loading.
  var watcher = load.watcher = new chokidar.FSWatcher(
    { persistent: false
    , atomic: 1000
    , depth: 0 });

  // bind watcher callbacks for this root path
  // these keep track of changes to the actual files
  // the point of adding them once per `load` call has to do with inheriting
  // the options passed to that load call. this is unintuitive and now that
  // options inheritance is implemented might be best resolved by removing
  // the defaultLoader (TODO)
  watcher.on('add',       added);
  watcher.on('addDir',    added);
  watcher.on('change',    changed);
  watcher.on('unlink',    removed);
  watcher.on('unlinkDir', removed);

  return load;

  function load (rootPath, _options) {

    // use absolute path of requested starting location
    rootPath = path.resolve(rootPath);

    // deduplicate: if this path has already been loaded
    // (as a result of having loaded some parent directory)
    // return the object that corresponds to it
    if (nodes[rootPath]) return nodes[rootPath];

    // extend loader defaults with any user overrides for this load operation
    _options = _options || {};
    var options = extend(true, {}, load.options, _options);

    // load node at `rootPath`.
    // if it's a directory, its contents are recursively loaded.
    // having passed the deduplication check above, we can assume
    // that this node is so far completely unknown to this loader.
    // the initial loading pass is done synchronously; can't wait for
    // the watcher to detect and add files when we add directories to it.
    return loadNode(rootPath);

    function loadNode (location, linkPath) {

      // use absolute path of this node
      location = path.resolve(location);

      // deduplicate again
      if (nodes[location]) return nodes[location];

      // missing nodes throw an error
      if (!fs.existsSync(location)) throw error.FILE_NOT_FOUND(location);

      // get info about the filesystem node
      var stat = fs.lstatSync(location);

      // dispatch on node type
      // TODO: if possible, meaningfully integrate other Unix file types:
      //       socket, fifo, block device, character device
      if (stat.isSymbolicLink()) {
        var node = loadLink(location, linkPath);
      } else if (stat.isFile()) {
        var node = loadFile(location);
      } else if (stat.isDirectory()) {
        var node = loadDirectory(location, linkPath);
      } else {
        throw error.LOADER_UNSUPPORTED(location);
      }

      // the JS object that we just created to represent a filesystem node
      // is made aware of the filesystem path that corresponds to it, and is
      // stored into the loader's node cache.
      node._sourcePath = location;
      node._rootPath = rootPath;
      node._loader = load;
      nodes[location] = node;

      // the `_justLoaded` flag makes sure that the first `added` event emitted
      // by the watcher ever for a certain file, having found the node already
      // loaded (by the initial `load(...)` call), does not turn into a `change`
      // event.
      node._justLoaded = true;

      return node;
    }

    function loadLink (location, linkPath) {
      var target   = fs.readlinkSync(location)
        , resolved = path.resolve(location, '..', target)
        , name     = path.basename(location)
        , node     = loadNode(resolved, linkPath || location)
        , link     = Link(name, node);
      return Link(path.basename(location), loadNode(resolved));
    }

    function loadDirectory (location, linkPath) {
      // load a directory if not already loaded
      var dirNode = nodes[location] || Directory(path.basename(location), options);

      // recursively load its children
      require('glob')
        .sync(path.join(linkPath || location, "*"))
        .forEach(function (f) {
          if (options.filter(f)) { // skip filtered nodes
            var newNode = loadNode(f);
            if (newNode) dirNode.add(newNode); } });

      // add to watcher
      watcher.add(location);

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

  }

  // watcher callbacks
  // since they are added once for each `load` call that does not return
  // an already loaded object, the `isChildOf` function is used to filter
  // out all the irrelevant events and run only the right one.

  function added (f, s) {
    //if (!isChildOf(rootPath, f)) return;

    // normalize: if an object already exists in memory
    // for this path, then this should be a change event
    if (nodes[f]) return changed(f, s);

    // load newly created node into glagol -- unless it's filtered out.
    if (!load.options.filter(f)) return;
    var node = load(f);
    if (!node) return;

    // automatically add the child node to its parent if already known
    var parent = nodes[path.dirname(f)];
    if (parent) parent.add(node);

    // emit events
    load.events.emit('added', node);
    if (parent) parent.events.emit('added', node);
  }

  function changed (f, s) {
    //if (!isChildOf(rootPath, f)) return;

    // normalize: if no object exists in memory for this
    // path, then this should be an add event
    var node = nodes[f];
    if (!node) return added(f, s);

    // in non-eager mode, source is only reloaded on demand
    // and there's nothing we need to do right now
    if (node.options.eager && File.is(node)) {
      node.source = node.options.reader(f);
    }

    // first 'changed' event for a node converts to 'added'
    if (node._justLoaded) {
      delete node._justLoaded;
      load.events.emit('added', node);
      if (node.parent) {
        node.parent.add(node) // re-add if deleted
        node.parent.events.emit('added', node);
      }
    } else {
      load.events.emit('changed', node);
      node.events.emit('changed', node);
      if (node.parent) node.parent.events.emit('changed', node);
    }
  }

  function removed (f, s) {
    //if (!isChildOf(rootPath, f)) return;

    var node = nodes[f];

    // normalize: if an object is already missing from memory,
    // then all is ok really, no need to do anything else to delete it.
    if (!node) return;

    // if parent object exists, renounce deleted child, so that no new
    // referrences to its value are created. but persist parent reference
    // so that the deleted node does not forget its relative location.
    // also set `_justLoaded` flag, so that next event is `added`, not
    // `changed`.
    var parent = node.parent;
    if (parent) parent.remove(node);
    node.parent = parent;
    node._justLoaded = true;

    // remove loader's reference to deleted node
    // delete nodes[f];

    // emit events
    load.events.emit('removed', node, parent);
    node.events.emit('removed', node, parent);
    if (parent) parent.events.emit('removed', node, parent);
  }

}

Loader.defaults =
  { filter:
      function defaultFilter (fullPath, rootPath) {
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

        var relpath  = path.relative(rootPath || "", fullPath)
          , basename = path.basename(fullPath);

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

        var pass = !conditions.some(function (x) { return !x; });
        var regexp = new RegExp("^" + require('os').homedir())
        if (!pass) console.log("not".red, fullPath.replace(regexp, "~"))
        return pass }

  , reader:
      function defaultReader (location) {
        return fs.readFileSync(location, 'utf8'); }

  , log:
      { added:
          function logAddition (node) {
            var regexp = new RegExp("^" + require('os').homedir())
              , type   = node._glagol.type.toLowerCase().slice(0, 3).green
              , root   = node._rootPath.replace(regexp, "~").black
            if (node._glagol.link) type = "lnk".blue;
            console.log(type, node._sourcePath.replace(regexp, "~")); }

      , changed:
          function logChange (node) {
            console.log("mod".yellow,
              node.path.bold); }

      , removed:
          function logRemoval (node, parent) {
            console.log("del".red,
              path.join(parent ? parent.path : "", node.name).bold); } } };
