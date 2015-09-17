var runtime = require('etude-engine/runtime.js')
  , etude   = runtime.requireWisp('etude-engine/engine.wisp')
  , fs      = require('fs')
  , temp    = require('temp').track();

describe('an Etude virtual filesystem', function () {

  var engine
    , mountpt
    , mounted;

  // TODO figure out why it only works in chdir

  beforeAll(function () {
    process.chdir('node_modules/etude-engine');
    engine = etude.start('spec/sample');
    mountpt = temp.mkdirSync('etude-fuse-test');
    mounted = require('../index.js')(mountpt);
  })

  beforeEach(function () {
  });

  it('can be mounted in a temporary directory', function () {
    expect(fs.existsSync(mountpt)).toBe(true);
    expect(mounted).toBe(undefined);
  });

  it('lists files corresponding to loaded notions', function () {});

  it('returns the values of notions when read from', function () {});

  it('updates the sources and values of notions when written to', function () {});

});
