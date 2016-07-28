var test = require('tape')
  , glagol = require('..');

test('option inheritance', function (t) {

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

test('client-side loader', function (t) {

  var browser =
    { loader:  require('../browser/loader')
    , require: require('../browser/require')
    , vm:      require('../browser/vm') };

  var fixture =
    { 'A.js':  '(function () {})'
    , 'B.txt': '8'
    , 'C.foo': ''
    , 'D.d':   { 'E.json': '{"foo":"bar..."}' } };

  var dummyFormat =
    { compile:  function (file) { return 'compiled'  }
    , evaluate: function (file) { return 'evaluated' } };

  t.plan(22);

  // testing initial load

  var load = browser.loader({ formats: { '.foo': dummyFormat } })
    , root = load(fixture);

  var A = root.get('A.js')
    , B = root.get('B.txt')
    , C = root.get('C.foo')
    , D = root.get('D.d')
    , E = D.get('E.json')

  t.equal(root.path, '/');

  t.equal(A.source, fixture['A.js']);
  t.equal(typeof A.value, 'function');

  t.equal(B.path, '/B.txt');
  t.equal(B.source, fixture['B.txt']);
  t.equal(typeof B.value, 'string');

  t.deepEqual(C.format, dummyFormat)
  t.equal(C.source, fixture['C.foo']);
  t.equal(C.compiled, 'compiled');
  t.equal(C.value, 'evaluated');

  t.equal(E.path, '/D.d/E.json');
  t.equal(E.source, fixture['D.d']['E.json']);
  t.equal(typeof E.value, 'object');

  // testing subsequent adding of nodes

  load.add('/D.d/F.d',
    { 'G.js':  '8'
    , 'H.txt': '8'
    , 'I.foo': '8' });

  var G = root.get('D.d/F.d/G.js')
    , H = root.get('D.d/F.d/H.txt')
    , I = root.get('D.d/F.d/I.foo')

  t.equal(G.source,   '8')
  t.equal(G.compiled, '8')
  t.equal(G.value,     8 )

  t.equal(H.source,   '8')
  t.equal(H.compiled, '8')
  t.equal(H.value,    '8')

  t.equal(I.source,   '8')
  t.equal(I.compiled, 'compiled')
  t.equal(I.value,    'evaluated')

})
