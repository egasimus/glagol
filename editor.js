var create    = require('virtual-dom/create-element')
  , h         = require('virtual-dom/h')
  , insertCss = require('insert-css')
  , http      = require('http-browserify');

document.replaceChild(createBody(), document.firstChild);
insertCss(require('./style.styl'));
getForms();

function createBody () {
  return create(
    h( 'html'
     , [ h( 'head'
          , h( 'title', 'Editor' ) )
       , h( 'body'
          , h('p', 'loading...' ) ) ] ) );
};

function getForms () {
  http.get({ path: '/forms' }, function (res) {
    var data = '';
    res.on('data', function (buf) {
      data += buf;
    });
    res.on('end', function () {
      // todo remove dual parse, conduct streaming parse
      document.body.innerHTML = "";
      parseForms(JSON.parse(data));
    });
  });
}

function parseForms (forms) {
  forms.map(function (f) {
    console.log(f);
    document.body.appendChild(create((
      f.head.name === 'def'
        ? (f.metadata.source.indexOf("use ") === 0)
          ? renderUse
          : renderDef
        : f.head.name === 'defn'
          ? renderFn
          : null)(f)));
  });
}

function renderUse (f) {
  console.log(f);
  return h('div.form.use',
    [ h('label', 'use')
    , h('.name', f.tail.head.name) ]);
}

function renderDef (f) {
  var src = f.tail.tail.head.metadata ?
    f.tail.tail.head.metadata.source : f.tail.tail.head;
  return h('div.form.def', 
    [ h('.name', f.tail.head.name)
    , h('.code', '  ' + src) ]);
}

function renderFn (f) {
  return h('div.form.defn',
    [ h('label', 'fn')
    , h('.name', f.tail.head.name)
    , h('.code', '  ' + f.tail.tail.head.metadata.source) ]);
}
