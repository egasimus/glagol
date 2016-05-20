var test = require('tape')
  , glagol = require('..');

test('options', function (t) {

  t.plan(7)

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

})
