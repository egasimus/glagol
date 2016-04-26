var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

module.exports = function (id) {
  return {

    subscribe: function subscribe (cb) {
      if (cb) $.model(function (val) { cb(serialize(val)) });
      return serialize($.model());
    },

    add: function add (type, address) {
      if (type === 'directory' || type === 'file') {
        var location = address[0] === '~'
          ? path.join(os.homedir(), address.slice(1))
          : address;
        var stats = fs.statSync(address);
        if (stats.isFile()) {
          type = 'file';
          $.model.files.put(address, stats);
        } else if (stats.isDirectory()) {
          type = 'directory';
          $.model.directories.put(address,
            fs.readdirSync(address).map(function (name) {
              return { name: name, stat: fs.statSync(path.join(address, name)) }
            }));
        }
      }
      $.model.frames.push({ type: type, address: address });
      $.log('add', type, 'at', address);
      return address;
    },

    remove: function remove (index) {
      $.log('remove', index);
      $.model.frames.splice(index, 1);
    },

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}
