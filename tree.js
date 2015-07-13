var runtime = require('./runtime.js');
var log = require('./logging.js').getLogger('trees');
var engine = runtime.requireWisp('./engine.wisp');
var web = runtime.requireWisp('lib/web.wisp');
var fs = require('fs');
var path = require('path');

var resolve = function (path) {
  return require('resolve').sync(path,
    { basedir:    './project'
    , extensions: [".js", ".wisp"] });
}

var pack = require("browser-pack");
var streamString = require("stream-string");
var shortid = require("shortid");
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
  log(requires);
  console.log();
  log(resolved);
  console.log();
  log(mapped);

  console.log();
  var source = "var deps=" + JSON.stringify(mapped) + ";"
    + "exports=function getRequire(a){"
    + "return function require(m){"
    + "return require(deps[a][m])}}";
  var packed = pack({raw: true});
  var ids = {};
  Object.keys(resolved).map(function (i) {
    var source = fs.readFileSync(i, 'utf8');
    if (path.extname(i) === '.wisp') {
      source = runtime.compileSource(source, i).output.code;
    }
    packed.write({ id: resolved[i], source: source})
    ids[resolved[i]] = i;
  });
  packed.write({ source: source, deps: ids });
  packed.end();
  streamString(packed).then(function (data) {
    console.log(data);
  }).error(function (err) { throw err });

}).done();

/*

function () {

var init
  , template
  , samplerTemplate;

var deref = function deref (atom) {
  return atom.value();
}

var requireMap = (function () {
  var modules = {
    VJROHD3O: { init: function () ... }
  }
  return function requireMap (map) {
    return function require (name) {
      return modules[map[name]];
    }
  }
})();

// this shit should go in a vm iframe
init = (function (require, exports) {
  var vdom = require("../lib/vdom.wisp");
  exports = vdom.init(script.parentElement, deref(template));
})(requireMap({"..lib/vdom.wisp":"VJROHD3O"}), {});

template = (function (require) {
  var vdom = require("../lib/vdom.wisp");
  exports = function templateApp () {
    return vdom.h(...);
  }
})(requireMap({"..lib/vdom.wisp":"VJROHD3O"}), {});

init();

}

*/

