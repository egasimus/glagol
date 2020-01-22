module.exports = glagol;

function glagol (source, options) {
  glagol.defaultLoader = glagol.defaultLoader || glagol.Loader();
  return glagol.defaultLoader(source, options);
}

glagol.Loader    = require('./core/loader.js');
glagol.File      = require('./core/file.js');
glagol.Directory = require('./core/directory.js');
glagol.Link      = require('./core/link.js');
glagol.Error     = require('./core/error.js');

if (process.browser) {
  glagol.require = require('./browser/require.js');
  glagol.vm      = require('./browser/vm.js');
}
