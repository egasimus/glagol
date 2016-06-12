var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

module.exports = function (data) {

  var state  = data.state
    , socket = data.socket;

  return {

    refresh:
      function () {
        socket.send(serialize(_.model()));
      },

    add:
      function (type, address) {

        var user = state.id
          , addr = getAddress(type, address)
          , id   = require('shortid').generate()
          , fr   = { id: id, type: type, address: addr };
        _.model.Frames.put(id, require('riko-mvc/model')(fr));
        _.model.Users.get(user).Frames.push(id);
        //$.log(user, 'added frame', id, type, 'at', addr);
        this.refresh();

      },

    remove:
      function (id) {

        $.log('remove frame', id);
        $.model.Frames.delete(id);

        this.refresh();

      },

    change:
      function (id, key, val) {

        $.model.Frames.get(id).put(key, val);

        this.refresh();

      },

    run:
      function (command) {

        var split = command.split(' ')
          , cmd   = split[0]
          , args  = split.slice(1)
          , id    = require('shortid').generate()
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
