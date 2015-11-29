var core = require('..')
  , fs   = require('fs');

xdescribe('a glagol.File', function () {

  it('knows its type', function () {
    var n1 = core.File();
    expect(n1.type).toBe('File');
  });

  it('knows its path and correctly derives its name from it', function () {
    var n1 = core.File('spec/sample/n1');
    expect(n1.path).toBe('spec/sample/n1');
    expect(n1.name).toBe('n1');
    var n121 = core.File('spec/sample/d1/d12/n121');
    expect(n121.path).toBe('spec/sample/d1/d12/n121');
    expect(n121.name).toBe('n121');
  });

  it('can have an empty name', function () {
    var n = core.File('');
    expect(n.name).toBe('');
    expect(n.path).toBe('');
  })

  it('has empty name and source if not specified', function () {
    var n = core.File();
    expect(n.name).toBe('');
    expect(n.path).toBe('');
    expect(n.source).toBe(undefined);
  })

  it('has source as specified', function () {
    var n = core.File('spec/sample/n1', '');
    expect(n.source).toBe('');
    var n = core.File('spec/sample/n1', 'NIICHAVO');
    expect(n.source).toBe('NIICHAVO');
  })

  it('automatically loads its source on request', function () {
    var n = core.File('spec/sample/n1');
    expect(n.source).toBe(fs.readFileSync('spec/sample/n1', 'utf8'));
  })

  it('automatically compiles on request', function () {
    var n = core.File('', '42');
    expect(n.compiled).toBe('42');
  })

  it('automatically evaluates on request', function () {
    var n = core.File('foo.js', '42');
    expect(n.value).toBe(42);
  })

  it('automatically recompiles and re-evaluates when its source is changed',
    function () {
      var n = core.File('foo.js', '42');
      n.source = '23';
      expect(n.compiled).toBe('23');
      expect(n.value).toBe(23);
    });

})

