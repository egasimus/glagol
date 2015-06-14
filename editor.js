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
      // todo streaming parse
      document.body.innerHTML = "";
      JSON.parse(data).map(parseForm);
    });
  });
}

function parseForm (f) {
  var el = create((
    f.head.name === 'def'
      ? (f.metadata.source.indexOf("use ") === 0)
        ? renderUse
        : renderDef
      : f.head.name === 'defn'
        ? renderFn
        : null)(f));
  el.addEventListener('click', function (evt) {
    if (evt.target.classList.contains('code')) {
      evt.target.contentEditable = true;
      evt.target.focus();
      evt.target.addEventListener('blur', function () {
        evt.target.contentEditable = false;
      })
    }
  });
  document.body.appendChild(el);
}

function renderUse (f) {
  return h('div.form.use',
    [ h('label', 'use')
    , h('.name', f.tail.head.name) ]);
}

function renderDef (f) {
  var src = f.tail.tail.head.tail.head.metadata ?
    f.tail.tail.head.tail.head.metadata.source :
    f.tail.tail.head.tail.head
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
