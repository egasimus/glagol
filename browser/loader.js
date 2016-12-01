var File      = require('../core/file')
  , Directory = require('../core/directory')
  , path      = require('path')
  , extend    = require('extend')
  , EE2       = require('eventemitter2').EventEmitter2;

module.exports = Loader;

function Loader (baseOptions) {

  if (this instanceof Loader) return Loader();

  baseOptions = baseOptions || {};
  load.options = extend(true,
    { shorthands: true
    , formats: require('../formats/index.js') }, baseOptions);

  load.nodes   = {};
  load.add     = add;
  load.update  = update;
  load.remove  = remove;

  load.connect = connect;

  load.events  = new EE2();
  load.events.on('added',   Loader.logAdded);
  load.events.on('changed', Loader.logChanged);
  load.events.on('removed', Loader.logRemoved);

  return load;

  function load (nodePath, source, overrides) {
    if (nodePath instanceof Object) return load("/", nodePath, source);
    if (load.nodes[nodePath]) return update(nodePath, source);

    overrides = overrides || {};
    var options = extend({}, load.options, overrides);
    options.formats = extend({}, load.options.formats, overrides.formats);

    var type = source instanceof Object ? loadDirectory : loadFile
      , node = type(nodePath, source);
    load.nodes[nodePath] = node;
    return node;

    function loadDirectory (nodePath, source) {
      var node = Directory(path.basename(nodePath), options);
      Object.keys(source).map(function (id) {
        var newNode = load(path.join(nodePath, id), source[id], options);
        node.add(newNode);
      });
      return node;
    }

    function loadFile (nodePath, source) {
      return File(path.basename(nodePath), extend({}, options, { source: source }));
    }
  }

  function add (nodePath, source) {
    if (load.nodes[nodePath]) return update(nodePath, source);

    var parent = load.nodes[path.dirname(nodePath)];
    if (!parent) {
      throw new Error("cannot add node " +  nodePath + " to missing parent");
    }

    var node;
    parent.add(node = load(nodePath, source));
    load.events.emit('added', node);
    if (!Directory.is(node) && node.parent) {
      node.parent.events.emit('added', node);
    }

  }

  function update (nodePath, source) {
    var node = load.nodes[nodePath];
    if (!node) return add(nodePath, source);
    node.source = source;
    load.events.emit('changed', node);
    node.events.emit('changed', node);
    if (!Directory.is(node) && node.parent) {
      node.parent.events.emit('changed', node);
    }
  }

  function remove (nodePath) {
    var node = load.nodes[nodePath];
    if (!node) return;

    var parent = node.parent;
    if (parent) parent.remove(node);
    node.parent = parent;

    load.events.emit('removed', node, parent);
    node.events.emit('removed', node, parent);
    if (!Directory.is(node) && parent) {
      parent.events.emit('changed', node);
    }
  }

  function connect (url) {
    url = url || 'wss://' + window.location.host;
    var socket = new WebSocket(url);
    socket.onopen = function () {
      socket.send('glagol') }
    socket.onmessage = function (msg) {
      var data = JSON.parse(msg.data);
      switch (data.event) {
        case 'glagol.added':      add(data.path, data.value);
        case 'glagol.changed': update(data.path, data.value);
        case 'glagol.removed': remove(data.path, data.value); } }
    return socket;
  }

}

Loader.logAdded = function (node) {
  var type = node._glagol.type.toLowerCase();
  console.log((new Date().toUTCString()) + " %cadded " + type,
    consoleTag("green"), node.name); };

Loader.logChanged = function (node) {
  console.log((new Date().toUTCString()) + " %cchanged",
    consoleTag("orange"), node.path); };

Loader.logRemoved = function (node, parent) {
  console.log((new Date().toUTCString()) + " %cremoved",
    consoleTag("darkred"), path.join(parent ? parent.path : "", node.name)) };

function consoleTag (color) {
  return "background:"+color+";color:white;font-weight:bold;padding:2px 6px"
}
