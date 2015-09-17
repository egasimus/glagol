var runtime = require('etude-engine/runtime.js')
  , etude   = runtime.requireWisp('etude-engine/engine.wisp');

describe('an Etude virtual filesystem', function () {

  // TODO figure out why it only works in chdir
  process.chdir('node_modules/etude-engine');
  var engine = etude.start('spec/sample');

  it('can be mounted in a temporary directory', function () {});

  it('lists files corresponding to loaded notions', function () {});

  it('returns the values of notions when read from', function () {});

  it('updates the sources and values of notions when written to', function () {});

});
