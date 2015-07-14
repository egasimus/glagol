var runtime = require('./runtime.js');
var log = require('./logging.js').getLogger('trees');
var engine = runtime.requireWisp('./engine.wisp');
var web = runtime.requireWisp('lib/web.wisp');
var path = require('path');
var browserify = require('browserify');
var shortid = require("shortid");
var resolve = function (path) {
  return require('resolve').sync(path,
    { basedir:    './project'
    , extensions: [".js", ".wisp"] });
}

var deps = [];

engine.start('./project').then(function (args) {
  var init = engine.ATOMS['init'];
  var deps = engine.getDeps(init);
  console.log();
  log(deps);
  var atoms = [init].concat(deps.derefs.map(function (name) { return engine.ATOMS[name] }));
  var requires = {};
  var resolved = {};

  atoms.map(function (atom) {
    requires[atom.name] = {};
    atom.requires.map(function (req) {
      var res = resolve(req);
      requires[atom.name][req] = res;
      if (Object.keys(resolved).indexOf(res) === -1) {
        resolved[res] = shortid.generate();
      }
    });
  });
  var mapped = {};
  Object.keys(requires).map(function (i) {
    mapped[i] = {};
    Object.keys(requires[i]).map(function (j) {
      mapped[i][j] = resolved[requires[i][j]];
    })
  })

  console.log();
  log("requires\n", requires);
  console.log();
  log("resolved\n", resolved);
  console.log();
  log("mapped\n",   mapped);

  var template =
    [ "var %%%IN HERE LADS%%%"
    , ";var deps="
    , JSON.stringify(mapped)
    , ";exports=function getRequire(a){"
    , "return function atomRequire(m){"
    , "return require(deps[a][m])}}"
    ].join("");

  console.log();
  var br = browserify();
  br.transform(web.wispify);
  Object.keys(resolved).map(function (module) {
    br.require(module, { expose: resolved[module] });
  })
  br.bundle(function (err, buf) {
    log(template.replace("%%%IN HERE LADS%%%", String(buf)));
  });

}).done();
