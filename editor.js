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
      parseForms(JSON.parse(JSON.parse(data)));
    });
  });
}

function parseForms (forms) {
  forms.map(function (f) {
    console.log(f);
    document.body.appendChild(create(
      f.head.name === 'use'  ? h('div', "USE " + f.tail.head.name) :
      f.head.name === 'def'  ? h('div', "DEF " + f.tail.head.name) :
      f.head.name === 'defn' ? h('div', "FN "  + f.tail.head.name) : null));
  })
}
