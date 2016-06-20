var path = require('path')
  , fs   = require('fs')
  , os   = require('os')
  , exec = require('child_process').execFileSync;

module.exports = function (state, respond) {

  return {

    GetInfo:
      function (location) {

        location = resolve(location.trim());
        _.log("GetInfo", location);

        var data = { path: location }

        try {
          data.stats = fs.statSync(location);
        } catch (e) {
          console.log(e);
          return;
        }

        data.type = getType(data.stats);

        if (data.type === 'directory') {
          data.items = readDir(location);
          _.model.Directories[location] = data;
        }

        if (data.type === 'file') {
          data.contentType = getContentType(location);
          _.model.Files[location] = data;
        }

        respond(JSON.stringify({ module: 'FS', data: data }));

      },

    ReadFile:
      function (location) {
        location = resolve(location.trim());
        _.log("ReadFile", location);
        require('fs').readFile(location,
          function fileRead (err, data) { respond(data) })
      }

  }

};

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
      , data     = { name: name }

    try {
      data.stat = fs.statSync(fullpath)
    } catch (e) {
      console.log(e);
      return;
    }

    if (data.stat.isDirectory()) {

      var files;

      try {
        files = fs.readdirSync(fullpath);
      } catch (e) {
        data.accessDenied = true;
        return data;
      }

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
