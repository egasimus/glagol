var test = require('tape')
  , glagol = require('..');

test('options', function (t) {

  t.plan(8);

  var f = glagol.File('test', { foo: 'bar' })
  t.deepEqual(f.options, { foo: 'bar' })

  f.options = { bar: 'baz' }
  t.deepEqual(f.options, { bar: 'baz' })

  f.options.foo = 'bar';
  t.deepEqual(f.options, { foo: 'bar', bar: 'baz' })

  var d = glagol.Directory({ foo: 'bar' })
  t.deepEqual(d.options, { foo: 'bar' })

  d.options = { bar: 'plot' }
  t.deepEqual(d.options, { bar: 'plot' })

  d.options.quux = 'asdf';
  t.deepEqual(d.options, { quux: 'asdf', bar: 'plot' })

  d.add(f);
  t.deepEqual(f.options, { foo: 'bar', bar: 'baz', quux: 'asdf' })

  d.options.quux = 'qwer';
  t.equal(f.options.quux, 'qwer');

})

test('browser', function (t) {

  var browser =
    { loader:  require('../browser/loader')
    , require: require('../browser/require')
    , vm:      require('../browser/vm') };

  var fixture =
    { 'A.js':  '(function () {})'
    , 'B.txt': '8'
    , 'C.d': { 'D.json': '{"foo":"bar..."}' } };

  t.plan(6);

  var load = browser.loader()
    , root = load(fixture);

  t.equal(root.get('A.js').source,       fixture['A.js']);
  t.equal(root.get('B.txt').source,      fixture['B.txt']);
  t.equal(root.get('C.d/D.json').source, fixture['C.d']['D.json']);
  t.equal(typeof root.get('A.js').value,       'function');
  t.equal(typeof root.get('B.txt').value,      'string');
  t.equal(typeof root.get('C.d/D.json').value, 'object');

})
