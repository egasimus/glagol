var colors = require('colors/safe')
  , path   = require('path')
  , log    = require('./logging.js').getLogger('boot');

// bootstrapper.
// enables live reloading of server-side process.

module.exports = function bootstrapper (sessionModule) {

  if (sessionModule === require.main) {
    var filename  = sessionModule.filename
      , shortname = path.relative(process.cwd(), filename);

    var session = null
      , start   =
          function bootstrapperStart () {
            log("loading", colors.green(shortname));
            delete require.cache[filename];
            session = require(filename);
            log("starting", colors.green(shortname));
            session.start().then(function () {
              log("started", colors.green(shortname));
            }).done();
          }
      , restart =
          function bootstrapperRestart () {
            if (session.stop) {
              session.stop().then(start).done();
            } else {
              session.start().done();
            }
          };

      var dedupe   = null
        , onChange =
            function onChange (fname, stat) {
              var duplicate = false;
              if (stat) {
                if (dedupe === stat.mtime) duplicate = true;
                dedupe = stat.mtime;
              }
              if (!duplicate) {
                if (fname) log("changed", colors.blue(path.relative(process.cwd(), fname)));
                restart()
              }
            }

      var chokOpts = { persistent:  true
                     , alwaysStat:  true
                     , useFsEvents: false }
        , watcher  = require('chokidar').watch(filename, chokOpts);

      //var oldRequire = require
        //, newRequire = Object.keys(require).reduce(
            //function (nreq, key) { nreq[key] = require[key]; return nreq },
            //function require (arg) {
              //var reqd = oldRequire.apply(null, arguments);
              //log("req", arguments[0])
              //watcher.add(arguments[0]);
              //return reqd;
            //}
          //);
      //global.require = newRequire;

      watcher.on("add", function (path) { log("added", path); })
      watcher.on("change", onChange);
      start();

  }
}
