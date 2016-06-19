var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

module.exports = function (state, respond) {

  return {

    Refresh:
      function () {
        respond(serialize({ module: 'Workspace', data: _.model() }));
      },

    Open:
      function (type, address) {

        var user = state.id
          , addr = getAddress(type, address)
          , id   = require('shortid').generate()
          , fr   = { id: id, type: type, address: addr };
        _.model.Frames.put(id, require('riko-mvc/model')(fr));
        _.model.Users.get(user).Frames.push(id);
        //$.log(user, 'added frame', id, type, 'at', addr);

        this['Workspace/Refresh']();

      },

    Close:
      function (id) {

        _.log('close frame', id);
        _.model.Frames.delete(id);

        this['Workspace/Refresh']();

      },

    Change:
      function (id, key, val) {

        _.model.Frames.get(id).put(key, val);

        this['Workspace/Refresh']();

      },

    Run:
      function (command) {

        var split = command.split(' ')
          , cmd   = split[0]
          , args  = split.slice(1)
          , id    = require('shortid').generate()
          , proc  = require('child_process').spawn(cmd, args);

        _.model.Processes.put(id,
          { id:      id
          , command: command
          , proc:    proc });

        this['Workspace/Refresh']();

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
