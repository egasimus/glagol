var runtime = require('./runtime.js');

var log = require('./logging.js').getLogger('trees');

var engine = runtime.requireWisp('./engine.wisp');

engine.start('./project').then(function () {
  log("foo");
  var init = engine.ATOMS['init'];
  log(init);
})

process.stdin.resume();
