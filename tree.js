var runtime = require('./runtime.js');

var log = require('./logging.js').getLogger('trees');

var engine = runtime.requireWisp('./engine.wisp');

var resolve = function (path) {
  return require('resolve').sync(path,
    { basedir:    './project'
    , extensions: [".js", ".wisp"] });
}

var deps = [];

engine.start('./project').then(function (args) {
  var init = engine.ATOMS['init'];

  var deps = engine.getDeps(init);

  log(deps);

  var atoms = [init].concat(deps.derefs.map(function (name) { return engine.ATOMS[name] }));

  atoms.map(function (atom) {
    log(atom.name, atom.requires);
    var requires = {};
    atom.requires.map(function (req) {
      requires[req] = deps.requires[resolve(req)];
    });
    log(requires);
  })

}).done();
