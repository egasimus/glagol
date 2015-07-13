var runtime = require('./runtime.js');

var log = require('./logging.js').getLogger('trees');

var engine = runtime.requireWisp('./engine.wisp');

var deps = [];

engine.start('./project').then(function (args) {
  var init = engine.ATOMS['init'];
  log("derefs", engine.getDeps(init));
}).done();
