var runtime = require('./runtime.js');

var log = require('./logging.js').getLogger('trees');

var engine = runtime.requireWisp('./engine.wisp');

var deps = [];

engine.start('./project').then(function (args) {
  var init = engine.ATOMS['init'];
  init.derefs.map(addDependency);
  log("done", deps);
}).done();

function addDependency (name) {
  if (deps.indexOf(name) === -1) {
    deps.push(name);
    var dep = engine.ATOMS[name];
    if (!dep) throw new Error("no atom " + name);
    dep.derefs.map(addDependency);
  }
}

process.stdin.resume();
