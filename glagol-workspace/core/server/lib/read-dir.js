var fs   = require('fs')
  , path = require('path')

module.exports = function (location) {
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
