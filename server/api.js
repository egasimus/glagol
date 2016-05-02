var path = require('path')
  , fs   = require('fs')
  , os   = require('os')

var API = module.exports = function (state, socket) {
  return function (message) {
    message = JSON.parse(message);
    return Promise(function (win, fail) {
      var command = API.commands[message[0]];
      if (API.commands[message[0]]) {
        win(command.apply(API.commands, message[1] || []))
      } else {
        fail("no command " + message[0]);
      }
    })
  }
}

API.commands = {

  read:
    function (location) {
      return Promise(function (win, fail) {
        location = resolve(location);
        var stats = fs.statSync(location);
          , data  = { path: location, stats: stats, type: getType(stats) };
        if (data.type === 'directory') {
          data.items = readDir(location);
        }
        if (data.type === 'file') {
        }
      }
    })

}

function resolve (location) {
  if (location[0] === '~' && location[1] === '/') {
    location = path.resolve(path.join(os.homedir(), location.slice(1)))
  }
  return location;
}

function getType (stats) {
  return stats.isFile()      ? 'file'
       : stats.isDirectory() ? 'directory'
                             : 'other';
}

function readDir function (location) {
  var items = fs.readdirSync(location);
  return items.map(identify(location));
}

function identify (parent) {
  return function (name) {
    var fullpath = path.join(parent, name)
      , data =
        { name: name
        , type: _.mimeType(fullpath)
        , stat: fs.statSync(fullpath) };
    if (data.stat.isDirectory()) {
      var files = fs.readdirSync(fullpath);
      data.files = files.length;
      if (files.indexOf('package.json') > 0) {
        try {
          data.package = JSON.parse(fs.readFileSync(path.join(fullpath, 'package.json')))
        } catch (e) {}
      }
      if (files.indexOf('.git') > 0) {
        data.git = true;
      }
    }
    return data;
  }
}
