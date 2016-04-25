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
      console.log('add', type, address)
      if (type === 'directory') {
        if (address[0] === '~') address = path.join(os.homedir(), address.slice(1));
        $.model.directories.put(address, require('fs').readdirSync(address))
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
