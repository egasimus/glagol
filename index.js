var path = require('path');

module.exports = load;

module.exports.File = require('./core/file.js');

module.exports.Directory = require('./core/directory.js');

function load () {
  return require('./core/loader.js').apply(null, arguments);
}
