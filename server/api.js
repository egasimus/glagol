var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

module.exports = function (state) {
  return {

    subscribe:
      function (cb) {
        if (cb) $.model(function (val) { cb(serialize(val)) });
        return serialize($.model());
      },

    add:
      function (type, address) {
        if (type === 'directory' || type === 'file') {
          var location = address[0] === '~'
            ? path.join(os.homedir(), address.slice(1))
            : address;
          var stats = fs.statSync(location);
          type = stats.isFile()
            ? loadFile(address, location, stats)
            : loadDir(address, location);
        }
        $.model.frames.push({ type: type, address: address });
        $.log('added', type, 'at', address);
        state.socket.send(serialize($.model()));
      },

    remove:
      function (index) {
        $.log('remove', index);
        $.model.frames.splice(index, 1);
      },

    refresh:
      function refresh (index) {
        $.log('refresh', index, $.model())
        var frame = $.model.frames()[index];
        $.log(frame);
        return true;
      }

  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}

function loadFile (address, location, stats) {
  var data = { name: location, type: $.lib.mimeType(location), stats: stats }
  $.model.files.put(address, data)
  return 'file'
}

function loadDir (address, location) {
  $.model.directories.put(address, $.lib.readDir(location));
  return 'directory'
}
