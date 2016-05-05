var path = require('path')
  , fs   = require('fs')
  , os   = require('os')
  , exec = require('child_process').execFileSync;

module.exports = require('riko-api2')(function (state) {

  return {

    read:
      function (location) {

        location = resolve(location.trim());
        $.log("read", location);

        var stats = fs.statSync(location)
          , data  = { path: location, stats: stats, type: getType(stats) };

        if (data.type === 'directory') {
          data.items = readDir(location);
          $.model.directories[location] = data;
        }

        if (data.type === 'file') {
          data.contentType = getContentType(location);
          $.model.files[location] = data;
        }

        state.socket.send(JSON.stringify(data))

      }

  }

});

function resolve (location) {
  if (location === '~') {
    location = os.homedir();
  } else if (location.indexOf('~/') === 0) {
    location = path.resolve(path.join(os.homedir(), location.slice(1)))
  }
  return location;
}

function getType (stats) {
  return stats.isFile()      ? 'file'
       : stats.isDirectory() ? 'directory'
                             : 'other';
}

function readDir (location) {
  var items = fs.readdirSync(location);
  return items.map(identify(location));
}

function identify (parent) {
  return function (name) {
    var fullpath = path.join(parent, name)
      , data =
        { name: name
        , type: ''//_.mimeType(fullpath)
        , stat: fs.statSync(fullpath) };
    if (data.stat.isDirectory()) {
      var files = fs.readdirSync(fullpath);
      data.files = files.length;
      if (files.indexOf('package.json') > -1) {
        try {
          data.package = JSON.parse(fs.readFileSync(path.join(fullpath, 'package.json')))
        } catch (e) {}
      }
      if (files.indexOf('.git') > -1) {
        data.git = true;
      }
    }
    return data;
  }
}

function getContentType (file) {
  var cmd  = 'file'
    , args = [ '-b', '--mime-type', file ]
    , data = null;
  try {
    data = exec(cmd, args).toString().trim();
  } catch (e) {}
  return data;
}
