require('segfault-handler').registerHandler("glagol-crash.log");

module.exports           = require('./core/loader.js')();
module.exports.Loader    = require('./core/loader.js');
module.exports.File      = require('./core/file.js')
module.exports.Directory = require('./core/directory.js');
