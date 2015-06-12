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
      f.head.name === 'use'  ? renderUse :
      f.head.name === 'def'  ? renderDef :
      f.head.name === 'defn' ? renderFn  : null)(f)));
  })
}

function renderUse (f) {
  return h('div.form.use',
    [ h('label', 'use')
    , h('.name', f.tail.head.name) ]);
}

function renderDef (f) {
  console.log("-->", f);
  return h('div.form.def', 
    [ f.tail.head.name
    , f.tail.tail.metadata.source ]);
}

function renderFn (f) {
  return h('div.form.defn',
    [ h('label', 'fn')
    , f.tail.head.name
    , f.tail.tail.metadata.source ]);
}
