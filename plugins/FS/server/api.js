var path = require('path')
  , fs   = require('fs')
  , os   = require('os')
  , exec = require('child_process').execFileSync;

module.exports = function (state, respond) {

  return {

    GetInfo:
      function (location) {

        var data;

        _.log("GetInfo", location = resolve(location.trim()));

        try {
          data = identify(location);
        } catch (e) {
          respond(JSON.stringify(
            { plugin: 'FS'
            , error:  true
            , code:   e.code
            , path:   e.path }))
        }

        if (!data) return;

        console.log("!!!", data)

        if (data.type === 'directory') {
          data.items = readDirectoryContents(location);
          _.model.Directories[location] = data;
        }

        if (data.type === 'file') {
          data.contentType = getContentType(location);
          _.model.Files[location] = data;
        }

        respond(JSON.stringify({ plugin: 'FS', data: data }));

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

function readDirectoryContents (location) {
  return fs.readdirSync(location)
    .map(function (item) { return path.join(location, item) })
    .map(identify);
}

function identify (fullpath) {

  var data = { name: path.basename(fullpath), path: fullpath }

  if (!data.stats) {
    try {
      data.stats = fs.statSync(fullpath)
    } catch (e) {
      _.log.error(data.path, e.code);
      data.stats = {};
      return data;
    }
  }

  if (data.stats.isDirectory()) {

    data.type = 'directory';

    try {
      var files = fs.readdirSync(fullpath);
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
      try {
        var status = exec('git', ['status', '-z'], { cwd: fullpath });
        data.git = status.length > 0 ? 'modified' : 'unmodified';
      } catch (e) {
        console.log(e);
      }
    }

  } else if (data.stats.isFile()) {

    data.type = 'file';

  }

  return data;

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

function parseGitStatus (status) {
  var separator = status.indexOf(0);
  if (separator) {
    console.log(
      String(status.slice(0, separator)),
      ' + ',
      String(status.slice(separator)));
  }
  return true;
}
