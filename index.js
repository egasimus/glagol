//require('segfault-handler').registerHandler("glagol-crash.log");
module.exports = glagol;

function glagol () {

  // a few different signatures are supported:
  // (source, options) -> Directory
  // (source)          -> Directory
  // (options)         -> Loader
  var source, options;
  if (arguments[1]) {
    source  = arguments[0];
    options = arguments[1];
  } else {
    if ("string" === typeof arguments[0]) {
      source = arguments[0];
    } else {
      options = arguments[0];
    }
  }

  if (!glagol.defaultLoader) {
    glagol.defaultLoader = glagol.Loader(options);
  }

  if (source) {
    return glagol.defaultLoader(source, options);
  } else {
    return glagol.defaultLoader;
  }

}

glagol.Loader    = require('./core/loader.js');
glagol.File      = require('./core/file.js');
glagol.Directory = require('./core/directory.js');
glagol.Error     = require('./core/error.js');

if (process.browser) {
  glagol.require = require('./browser/require.js');
  glagol.vm      = require('./browser/vm.js');
}
