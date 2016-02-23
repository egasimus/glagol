var File      = require('../core/file')
  , Directory = require('../core/directory')
  , path      = require('path')
  , xtend     = require('xtend');

module.exports = Loader;

function Loader (baseOptions) {

  if (this instanceof Loader) return Loader();

  baseOptions = baseOptions || {};
  load.options = xtend({ shorthands: true }, baseOptions);
  load.options.formats = xtend(
    require('../formats/index.js'), baseOptions.formats);

  load.nodes  = {};
  load.update = update;
  load.remove = remove;
  load.events = new (require('eventemitter3'))();
  load.events.on('added',   Loader.logAdded);
  load.events.on('changed', Loader.logChanged);
  load.events.on('removed', Loader.logRemoved);

  return load;

  function load (name, source, _options) {
    if (name instanceof Object) return load("/", name, source);
    if (load.nodes[name]) return update(name, source);

    _options = _options || {};
    var options = xtend(load.options, _options);
    options.formats = xtend(load.options.formats, _options.formats);

    var type = source instanceof Object ? loadDirectory : loadFile
      , node = type(name, source);
    load.nodes[name] = node;
    return node;

    function loadDirectory (name, source) {
      var node = Directory(path.basename(name), options);
      Object.keys(source).map(function (id) {
        var newNode = load(path.join(name, id), source[id], options);
        node.add(newNode);
      });
      return node;
    }

    function loadFile (name, source) {
      return File(path.basename(name), xtend(options, { source: source }));
    }
  }

  function add (name, source) {
    var node = load.nodes[name];
    if (node) return update(name, source);
    node = load(name, source);
    load.events.emit('added', node);
  }

  function update (name, source) {
    var node = load.nodes[name];
    if (!node) return add(name, source);
    node.source = source;
    load.events.emit('changed', node);
  }

  function remove (name) {
    var node = load.nodes[name];
    if (!node) return;

    var parent = node.parent;
    if (parent) parent.remove(node);
    delete load.nodes[name];
    load.events.emit('removed', node, parent);
  }

}

Loader.logAdded = function (node) {
  var type = node._glagol.type.toLowerCase();
  console.log("%cadded " + type, consoleTag("green"), node.name);
};

Loader.logChanged = function (node) {
  console.log("%cchanged", consoleTag("orange"), node.path);
};

Loader.logRemoved = function (node, parent) {
  console.log("%cremoved", consoleTag("darkred"),
    path.join(parent ? parent.path : "", node.name))
};

function consoleTag (color) {
  return "background:"+color+";color:white;font-weight:bold;padding:2px 6px"
}
