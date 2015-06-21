var h         = require('virtual-dom/h')
  , http      = require('http-browserify')
  , Q         = require('q');


// state
var state = require('observ')({});
function updateState (changes) {
  var snapshot = state();
  Object.keys(changes).map(function (k) {
    snapshot[k] = changes[k];
  });
  state.set(snapshot);
}


// events
var events = new (require('eventemitter2').EventEmitter2)();
function emit (evt) {
  return function (arg) {
    events.emit(evt, arg);
  }
}


// templates
var templates = {

  document:
    function templateDocument () {
      var bodyContents =
        state().loading ? 'loading...'
                        : templates.body();

      return h( 'html'
         , [ h( 'head'
              , h( 'title', 'Editor' ) )
           , h( 'body', bodyContents ) ] );
    },

  body:
    function templateBody () {
      var s    = state()
        , body = [];

      if (s.files) {
        body.push(templates.bar());
        console.log(s.files, s.activeFile, s.files[s.activeFile]);
        (s.files[s.activeFile].forms || []).map(function (f, i) {
          body.push(templates.form(f, i));
        })
      } else {
        body = [];
      }

      return body;
    },

  bar:
    function templateBar (files) {
      return h( '.bar',
        Object.keys(state().files).map(function(file, i) {
          var el = templates.barFile(file, i);
          return el; }) );
    },

  barFile:
    function templateBarFile (filename, i) {
      return h(
        '.bar-file' + (state().activeFile == filename ? '.active' : ''),
        { dataset: { filename: filename }
        , onclick: emit('file-selected') },
        filename);
    },

  form:
    function templateForm (f, i) {
      var s      = state()
        , active = i == s.files[s.activeFile].activeForm;
      return (
        f.head.name === 'def'
          ? (f.metadata.source.indexOf("use ") === 0)
            ? templates.use
            : templates.def
          : f.head.name === 'defn'
            ? templates.fn
            : null)(f, active, i);
    },

  use:
    function templateUse (f, active, i) {
      return h('div.form.use' + (active ? '.active' : ''),
        { dataset: { index: i }
        , onclick: emit('form-selected')},
        [ h('label', 'use')
        , h('.name', f.tail.head.name) ]);
    },

  def:
    function templateDef (f, active, i) {
      var src = f.tail.tail.head.tail.head.metadata ?
        f.tail.tail.head.tail.head.metadata.source :
        f.tail.tail.head.tail.head
      return h('div.form.def' + (active ? '.active' : ''),
        { dataset: { index: i }
        , onclick: emit('form-selected')},
        [ h('.name', f.tail.head.name)
        , h('.code',
            { contentEditable: active ? 'true' : 'inherit' },
            '  ' + src) ]);
    },

  fn:
    function templateFn (f, active, i) {
      return h('div.form.defn' + (active ? '.active' : ''),
        { dataset: { index: i }
        , onclick: emit('form-selected')},
        [ h('label', 'fn')
        , h('.name', f.tail.head.name)
        , h('.code',
            { contentEditable: active ? 'true' : 'inherit' },
            '  ' + f.tail.tail.head.metadata.source) ]);
    }

};


// view
var view = {};
state(function updateView () {
  var newTree = templates.document()
    , patches = require('virtual-dom/diff')(view.tree, newTree);
  view.node = require('virtual-dom/patch')(view.node, patches);
  view.tree = newTree;
})


// load data from server
init();

function init () {
  view.tree = templates.document();
  view.node = require('virtual-dom/create-element')(view.tree);
  document.replaceChild(view.node, document.firstChild);
  require('insert-css')(require('./editor.styl'));
  getFiles().then(concurrently(getForms)).done();
}

function getFiles () {
  var deferred = Q.defer();
  http.get({ path: '/files' }, handleStreamingResponse(function (data) {
    var filenames = JSON.parse(data)
      , files     = {};
    filenames.map(function (filename) { files[filename] = {} });
    updateState(
      { files:      files
      , activeFile: (filenames.length > 0) ? filenames[0] : null });
    deferred.resolve(filenames);
  }));
  return deferred.promise;
}

function getForms (filename) {
  var deferred = Q.defer();
  http.get({ path: '/forms?file=' + filename }, handleStreamingResponse(function (data) {
    var forms = JSON.parse(data)
      , files = state().files;
    files[filename].forms = forms;
    updateState({ files: files });
    deferred.resolve(forms);
  }));
  return deferred.promise;
}


// event handlers

events.on("file-selected", function (evt) {
  if (evt.currentTarget.dataset.filename) {
    updateState({ activeFile: evt.currentTarget.dataset.filename });
  }
});

events.on("form-selected", function (evt) {
  if (evt.currentTarget.dataset.index) {
    var s     = state()
      , files = s.files;
    files[s.activeFile].activeForm = evt.currentTarget.dataset.index;
    updateState({ files: files });
  }
});

function onFormClick (f, evt) {
  var ed = evt.target
  if (ed.classList.contains('code')) {
    ed.classList.add('editing');
    ed.focus();
    var onKey = onFormKeyDown.bind(null, f, ed);
    ed.addEventListener('keydown', onKey);
    ed.addEventListener('blur', function blur () {
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


// server commands
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


// utilities
function handleStreamingResponse(cb) {
  return function (res) {
    var data = '';
    res.on('data', function (buf) { data += buf; });
    res.on('end',  function ()    { cb(data);    });
  }
}

function concurrently (cb) {
  return function runConcurrently (args) {
    return Q.allSettled(args.map(cb));
  }
}
