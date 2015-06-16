var create    = require('virtual-dom/create-element')
  , h         = require('virtual-dom/h')
  , insertCss = require('insert-css')
  , http      = require('http-browserify');

document.replaceChild(createBody(), document.firstChild);
insertCss(require('./editor.styl'));
getForms();

function createBody () {
  return create(
    h( 'html'
     , [ h( 'head'
          , h( 'title', 'Editor' ) )
       , h( 'body'
          , h('p', 'loading...' ) ) ] ) );
};

function handleStreamingResponse(cb) {
  return function (res) {
    var data = '';
    res.on('data', function (buf) { data += buf; });
    res.on('end',  function ()    { cb(data);    });
  }
}

function getForms () {
  http.get({ path: '/forms' }, handleStreamingResponse(function (data) {
    // todo streaming parse
    document.body.innerHTML = "";
    JSON.parse(data).map(parseForm);
  }));
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
  el.addEventListener('click', onFormClick.bind(null, f));
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

function onFormClick (f, evt) {
  var ed = evt.target
  if (ed.classList.contains('code')) {
    ed.contentEditable = true;
    ed.classList.add('editing');
    ed.focus();
    var onKey = onFormKeyDown.bind(null, f, ed);
    ed.addEventListener('keydown', onKey);
    ed.addEventListener('blur', function blur () {
      ed.contentEditable = false;
      ed.classList.remove('editing');
      ed.removeEventListener('keydown', onKey);
    })
  }
}

function onFormKeyDown (f, ed, evt) {
  if (evt.ctrlKey && evt.which === 13) {        // C-<Enter>
    updateForm(f, ed.innerText);
  } else if (evt.ctrlKey && evt.which === 83) { // C-S
    evt.preventDefault();
    saveSession();
  } else if (evt.keyCode === 9) {
    evt.preventDefault();
  } else if (evt.keyCode === 27) {
    ed.blur();
  }
}

function updateForm (f, val) {
  if (f.head.name === 'def') {
    executeCode(f, "(%1.update (fn []\n%2))"
      .replace("%1", f.tail.head.name)
      .replace("%2", val));
  }
}

function saveSession () {
  var req = http.request(
    { method: 'POST'
    , path:   '/save' },
    handleStreamingResponse(function (data) {
      console.log(JSON.parse(data));
    }));
  req.end("");
}

function executeCode(f, code) {
  var req = http.request(
    { method: 'POST'
    , path:   '/repl' },
    handleStreamingResponse(function (data) {
      console.log(JSON.parse(data));
    }));
  req.end(code);
}
