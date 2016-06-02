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

        var user = state.id
          , addr = getAddress(type, address)
          , id   = $.lib.makeId()
          , fr   = { id: id, type: type, address: addr };
        $.model.frames.put(id, $.lib.model(fr))
        $.model.users.get(user).frames.push(id);
        $.log(user, 'added frame', id, type, 'at', addr);

        this.refresh();

      },

    remove:
      function (id) {

        $.log('remove frame', id);
        $.model.frames.delete(id);

        this.refresh();

      },

    change:
      function (id, key, val) {

        $.model.frames.get(id).put(key, val);

        this.refresh();

      },

    run:
      function (command) {

        var split = command.split(' ')
          , cmd   = split[0]
          , args  = split.slice(1)
          , id    = $.lib.makeId()
          , proc  = require('child_process').spawn(cmd, args);

        $.model.processes.put(id,
          { id:      id
          , command: command
          , proc:    proc });

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
