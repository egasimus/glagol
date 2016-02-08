var File      = require('../core/file')
  , Directory = require('../core/directory')
  , path      = require('path');

module.exports = Loader;

function Loader () {

  if (this instanceof Loader) return Loader();

  load.nodes  = {};
  load.events = new (require('eventemitter3'))();

  return load;

  function load (name, source) {

    if (name instanceof Object) return load("/", name);

    if (load.nodes[name]) return load.nodes[name];

    var node;

    if (source instanceof Object) {
      node = Directory(name ? path.basename(name) : null);
      Object.keys(source).map(function (id) {
        node.add(load(path.join(name, id), source[id]));
      });
    } else {
      node = File(path.basename(name), source);
    }

    load.nodes[name] = node;
    load.events.emit('added', node);

    return node;

  }

}
