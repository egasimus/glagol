var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

module.exports = function (state) {
  return {

    refresh:
      function () {
        state.socket.send(serialize($.model()));
      },

    add:
      function (type, address) {
        address = getAddress(type, address);
        var id = $.lib.makeId()
          , w  = $.lib.model({ id: id, type: type, address: address });
        $.model.windows.put(id, w)
        $.log('added window', id, type, 'at', address);
        this.refresh();
      },

    remove:
      function (index) {
        $.log('remove', index);
        $.model.frames.splice(index, 1);
        this.refresh();
      },

    change:
      function (id, key, val) {
        $.model.frames.get(id).put(key, val);
        this.refresh();
      }

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}

function getAddress (type, address) {
  address = address || '';
  if (type === 'directory' || type === 'file') {
    if (address === '~') {
      return os.homedir();
    }
    if (address.indexOf('~/') === 0) {
      return path.join(os.homedir(), address.slice(1));
    }
  }
  return address;
}

//function loadFile (address, location, stats) {
  //var data = { name: location, type: $.lib.mimeType(location), stats: stats }
  //$.model.files.put(address, data)
  //return 'file'
//}

//function loadDir (address, location) {
  //$.model.directories.put(address, $.lib.readDir(location));
  //return 'directory'
//}
