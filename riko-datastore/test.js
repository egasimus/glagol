test = require('tape')
ds = require('.')

test('datastore is created', function (t) {

  var d;
  t.plan(6);

  d = ds();
  t.equal(d.get(),   undefined);
  t.equal(d.get(''), undefined);
  t.equal(d.get('Foo'), undefined);

  d = ds(true);
  t.equal(d.get(),   1);
  t.equal(d.get(''), 1);
  t.equal(d.get('Foo'), undefined);

  d = ds({ Foo: 'Bar' });
  t.deepEqual(d.get(),   { Foo: 'Bar' });
  t.deepEqual(d.get(''), { Foo: 'Bar' });
  t.deepEqual(d.get('Foo'), 'Bar');

})

test('datastore holds values', function (t) {
})

test('datastore supports watchers', function (t) {
})

test('datastore supports rules', function (t) {
})
