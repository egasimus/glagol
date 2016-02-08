// transport-agnostic loader
module.exports = require('./loader.js')();
module.exports.Loader = require('./loader.js');

// core primitives
module.exports.File = require('../core/file.js');
module.exports.Directory = require('../core/directory.js');

// patches for running code in browser
module.exports.require = require('./require.js');
module.exports.vm = require('./vm.js');
