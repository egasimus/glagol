var fs        = require('fs')
  , path      = require('path')
  , colors    = require('colors')
  , extend    = require('extend')
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
    , printTree:  true
    , formats:    require('../formats/index.js') }, baseOptions);

  // events and logging
  load.events = new (require('eventemitter2').EventEmitter2)(
    { maxListeners: 0 });
  if (load.options.log) {
    load.events.on('added',   Loader.defaults.log.added);
    load.events.on('changed', Loader.defaults.log.changed);
    load.events.on('removed', Loader.defaults.log.removed); }

  // node cache: glagol objects corresponding to loaded filesystem nodes
  // (files, directories, etc.; henceforth: nodes) are stored here
  var nodes = {};

  // a single watcher keeps track of all loaded nodes. its `depth` option
  // is set to 0, since directories are only ever added manually.
  var watcher = load.watcher = new (require('chokidar').FSWatcher)(
    { persistent: false, atomic: 1000, depth: 0 });
  watcher.on('add', added);
  watcher.on('addDir', added);
  watcher.on('change', changed);
  watcher.on('unlink', removed);
  watcher.on('unlinkDir', removed);

  return load;

  function load (rootPath, _options) {

    // use absolute path of requested starting location, and deduplicate:
    // if this path has already been loaded (as a result of having loaded some
    // parent directory, perhaps) return the object that corresponds to it.
    rootPath = path.resolve(rootPath);
    if (nodes[rootPath]) return nodes[rootPath];

    // extend loader defaults with any user overrides for this load operation
    _options = _options || {};
    var options = extend(true, {}, load.options, _options);

    // load the node. if it's a directory, its contents are recursively loaded.
    // the initial loading pass is done synchronously; can't wait for
    // the watcher to detect and add files when we add directories to it.
    console.log(rootPath.bold);
    return loadNode(rootPath, { depth: -1 });

    function loadNode (location, state) {

      // get absolute path of this node; deduplicate; throw error if missing
      location = path.resolve(location);
      if (nodes[location]) return nodes[location];
      if (!fs.existsSync(location)) throw error.FILE_NOT_FOUND(location);

      // dispatch on node type (TODO: socket, fifo, blockdev, chardev ?)
      var stat = fs.lstatSync(location)
        , nextState = extend({}, state, { depth: state.depth + 1});
      if (stat.isSymbolicLink()) {
        var node = loadLink(location, state);
      } else if (stat.isFile()) {
        var node = loadFile(location, state);
      } else if (stat.isDirectory()) {
        var node = loadDirectory(location, nextState);
      } else {
        throw error.LOADER_UNSUPPORTED(location);
      }

      // make node aware of its filesystem path, and store it in loader's cache.
      // the `_justLoaded` flag makes sure that the first `added` event emitted
      // by the watcher ever for a certain file, having found the node already
      // loaded (by the initial `load(...)` call), does not become `change`.
      node._justLoaded = true;
      node._sourcePath = location;
      node._loader     = load;
      nodes[location]  = node;
      return node;
    }

    function loadLink (location, state) {
      var target    = fs.realpathSync(location)
        , resolved  = path.resolve(location, '..', target)
        , name      = path.basename(location)
        , nextState = extend({}, state, { linkPath: state.linkPath || location })
        , node      = loadNode(resolved, nextState)
        , link      = Link(name, node);
      return Link(path.basename(location), node);
    }

    function loadDirectory (location, state) {

      // add to watcher
      watcher.add(location);

      if (options.printTree && state.depth > 0)
        require('./util').printDirectory(location, state);

      // load directory and contents
      var dirNode = Directory(path.basename(location), options);
      require('glob')
        .sync(path.join(location, "*"))
        .forEach(function (f, i, a) {
          var nextState = extend({}, state, { linkPath: null })
          if (options.filter(f)) { // skip filtered nodes
            var newNode = loadNode(f, nextState);
            if (newNode) dirNode.add(newNode);
          } else {
            if (options.printTree)
              require('./util').printIgnored(f, nextState, i, a);
          } });

      return dirNode;
    }

    function loadFile (location, state) {

      if (options.printTree)
        require('./util').printFile(location, state);

      // load a file if not already loaded
      var node = File(path.basename(location), options);

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
      //load.events.emit('added', node);
      if (node.parent) {
        node.parent.add(node); // re-add if deleted
        node.parent.events.emit('added', node);
      }
    } else {
      load.events.emit('changed', node);
      node.events.emit('changed', node);
      if (node.parent) node.parent.events.emit('changed', node);
    }
  }

  function removed (f, s) {
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

    // emit events
    load.events.emit('removed', node, parent);
    node.events.emit('removed', node, parent);
    if (parent) parent.events.emit('removed', node, parent);
  }

}

Loader.defaults =
  { filter:
      function defaultFilter (location) {
        // by default, Glagol's loader ignores a filesystem node if its path matches
        // any of these conditions:
        //   * if its path (relative to loader root) contains `node_modules`
        //     (so that the potentially thousands of files belonging to libraries
        //     installed there are not watched; use `require('...')` to load them;
        //     check uses relative path so that any Glagol-aware libraries in
        //     `node_modules` can use the same loader without their files being
        //     ignored)
        //   * filename ends with `.swp` or `.swo`, a.k.a. Vim tempfiles
        //   * any dotfiles

        var basename = path.basename(location);

        var conditions =
          [ location.indexOf('node_modules') < 0
          , !require('./util').endsWith(basename, '.swp')
          , !require('./util').endsWith(basename, '.swo')
          , basename[0] !== '.' ];

        var pass = !conditions.some(function (x) { return !x; });
        var regexp = new RegExp("^" + require('os').homedir());
        return pass; }

  , reader:
      function defaultReader (location) {
        return fs.readFileSync(location, 'utf8'); }

  , log:
      { added:
          function logAddition (node) {
            var type = node._glagol.type.toLowerCase().slice(0, 3).green;
            if (node._glagol.link) type = "lnk".blue;
            console.log(type, require('./util').homedir(node._sourcePath)); }

      , changed:
          function logChange (node) {
            console.log("mod".yellow,
              node.path); }

      , removed:
          function logRemoval (node, parent) {
            console.log("del".red,
              path.join(parent ? parent.path : "", node.name)); } } };
