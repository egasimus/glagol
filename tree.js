var runtime = require('./runtime.js');

var log = require('./logging.js').getLogger('trees');

var engine = runtime.requireWisp('./engine.wisp');

var deps = [];

engine.start('./project').then(function (args) {
  var init = engine.ATOMS['init'];
  log(init.derefs);
  log("derefs", engine.getDerefs(init));
  log("requires", engine.getRequires(init));
}).done();
