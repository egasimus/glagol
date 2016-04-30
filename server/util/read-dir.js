var fs   = require('fs')
  , path = require('path')

module.exports = function (location) {
  var items = fs.readdirSync(location);
  return items.map(identify(location));
}

function identify (location) {
  console.log('id', location)
  return function (name) {
    console.log('id', location, name)
    var fullpath = path.join(location, name)
      , data =
        { name: name
        , type: $.mimeType(fullpath)
        , stat: fs.statSync(fullpath) };
    return data;
  }
}
