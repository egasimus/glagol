var h         = require('virtual-dom/h')
  , http      = require('http-browserify')
  , Q         = require('q');


// state
var state = require('observ')({ mode: 'navigate' });
function updateState (changes) {
  changes = changes || {};
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
        body.push(templates.tabBar());
        body.push(templates.toolBar());
        (s.files[s.activeFile].forms || []).map(function (f, i) {
          body.push(templates.form(f, i));
        })
      } else {
        body = [];
      }

      return body;
    },

  tabBar:
    function templateBar () {
      return h( '.tab-bar',
        Object.keys(state().files).map(function(file, i) {
          var el = templates.tab(file, i);
          return el; }) );
    },

  tab:
    function templateBarFile (filename, i) {
      return h(
        '.tab-bar-file' + (state().activeFile == filename ? '.active' : ''),
        { dataset: { filename: filename }
        , onclick: emit('file-selected') },
        filename);
    },

  toolBar:
    function templateToolBar () {
      return h( '.toolbar',
        [ h( '.toolbar-button', { }, state().mode )
        , h( '.toolbar-button', { onclick: emit('execute-file') }, "execute file" ) ] )
    },

  form:
    function templateForm (f, i) {
      var s         = state()
        , active    = i == s.files[s.activeFile].activeForm
        , nameFocus = s.mode === 'rename' && active
        , bodyFocus = s.mode === 'edit' && active;
      return h(
        'div.form.type-' + f.type + (active ? '.active' : ''),
        { dataset: { index: i }
        , onclick: emit('form-selected') },
        [ h('label', f.type)
        , h('input.name' + (nameFocus ? '.focus-me' : ''),
            { placeholder: 'enter name...'
            , onblur:      emit('exit-mode')
            , onfocus:     emit('rename-form')
            , value:       f.name || ''})
        , f.type === 'use'
            ? undefined
            : new (require('./editor-widget.js'))(
                (f.body ? ('  ' + f.body) : ''), bodyFocus) ]);
    },

};


// view
var view = {};
state(function updateView () {
  var newTree = templates.document()
    , patches = require('virtual-dom/diff')(view.tree, newTree);
  view.node = require('virtual-dom/patch')(view.node, patches);
  view.tree = newTree;

  var focused = false;
  Array.prototype.map.call(document.getElementsByClassName('focus-me'), function (el) {
    if (!focused) { el.focus(); focused = true }
    el.classList.remove('focus-me');
  });
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

keymap =
  { navigate:
    { 13: 'execute-form'  // <Enter>
    , 65: 'add-atom'      // a
    , 67: 'call-form'     // c
    , 68: 'delete-form'   // d
    , 69: 'edit-form'     // e
    , 70: 'add-fn'        // f
    , 72: 'previous-tab'  // h
    , 74: 'next-form'     // j
    , 75: 'previous-form' // k
    , 76: 'next-tab'      // l
    , 77: 'move-form'     // m
    , 82: 'rename-form'   // r
    , 87: 'save-file'     // w
    }
  , rename:
    { 13: 'end-rename'    // <Enter>
    , 27: 'exit-mode'     // <Esc>
    }
  , edit:
    {  9: 'insert-tab'    // <Tab>
    , 27: 'exit-mode' }   // <Esc>
}

document.addEventListener('keydown', function (evt) {
  var active = document.activeElement
    , mode   = state().mode;
  if (mode && keymap[mode] && keymap[mode][evt.which]) {
    evt.preventDefault();
    events.emit(keymap[mode][evt.which], evt);
  } else {
    console.log('keypress', evt.which);
  }
});


events.on("file-selected", function (evt) {
  if (evt.currentTarget.dataset.filename) {
    updateState({ activeFile: evt.currentTarget.dataset.filename });
  }
});

events.on("save-file", function () {
  var s = state();
  console.log("Saving file", s.activeFile);
  var source = "";
  s.files[s.activeFile].forms.map(function (f, i) {
    if (i > 0) source += "\n\n";
    if (f.type === 'use') {
      source += "use " + f.name;
    } else if (f.type === 'fn') {
      source += "fn " + f.name + "\n  " + f.body;
    } else if (f.type === 'atom') {
      source += f.name + "\n  " + f.body;
    }
  })
  post('/save?file=' + s.activeFile, source).then(function (response) {
    console.log("Saved", s.activeFile, ":", response);
  }).done()
})

events.on("next-tab", function () {
  var s     = state()
    , files = Object.keys(s.files)
    , next  = files.indexOf(s.activeFile) + 1;
  if (next >= files.length) next = 0;
  updateState({ activeFile: files[next] });
});

events.on("previous-tab", function () {
  var s     = state()
    , files = Object.keys(s.files)
    , next  = files.indexOf(s.activeFile) - 1;
  if (next < 0) next = files.length - 1;
  updateState({ activeFile: files[next] });
});

events.on("form-selected", function (evt) {
  if (evt.currentTarget.dataset.index) {
    var s     = state()
      , files = s.files;
    files[s.activeFile].activeForm = parseInt(evt.currentTarget.dataset.index);
    updateState();
  }
});

events.on("next-form", function () {
  var s      = state()
    , file   = s.files[s.activeFile];
  if (file.activeForm || file.activeForm === 0) {
    file.activeForm++;
    if (file.activeForm >= file.forms.length) file.activeForm = 0;
  } else {
    file.activeForm = 0;
  }
  updateState();
});

events.on("previous-form", function () {
  var s     = state()
    , file  = s.files[s.activeFile];
  file.activeForm = (file.activeForm || file.forms.length) - 1;
  updateState();
});

events.on("add-atom", function (evt) {
  addForm('atom', evt.shiftKey);
});

events.on("add-fn", function (evt) {
  addForm('fn', evt.shiftKey);
});

function addForm(type, above) {
  var s     = state()
    , files = s.files
    , file  = files[s.activeFile]
    , index = above ? file.activeForm ? file.activeForm     : 0
                    : file.activeForm ? file.activeForm + 1 : file.forms.length;
  file.forms.splice(index, 0, { type: type, isNew: true });
  file.activeForm = index;
  updateState({ files: files, mode: 'rename' });
}

events.on("delete-form", function () {
  var s     = state()
    , files = s.files
    , file  = files[s.activeFile]
  file.forms.splice(file.activeForm, 1);
  updateState({ files: files });
});

events.on("exit-mode", function () {
  document.activeElement.blur();
  updateState({ mode: 'navigate' });
});

events.on("edit-form", function () {
  updateState({ mode: 'edit' });
});

events.on("rename-form", function () {
  updateState({ mode: 'rename' });
});

events.on("end-rename", function () {
  var s = state()
    , f = s.files[s.activeFile].forms[s.files[s.activeFile].activeForm];
  if (f.isNew) {
    events.emit("edit-form");
  } else {
    events.emit("exit-mode");
  }
});

events.on("go-to-code", function () {
  var s    = state()
    , f    = document.getElementsByClassName('form')[s.files[s.activeFile].activeForm || 0]
    , name = f.getElementsByClassName('name')[0]
    , code = f.getElementsByClassName('code')[0];
  //console.log(f.getElementsByClassName('code')[0]);
  //f.getElementsByClassName('code')[0].childNodes[1].childNodes[0].focus();
});

events.on("execute-file", function () {
  post('/run').then(function (data) {
    console.log(JSON.parse(data));
  }).done();
});


// server commands
function updateForm (f, val) {
  if (f.head.name === 'def') {
    executeCode(f, "(%1.update (fn []\n%2))"
      .replace("%1", f.tail.head.name)
      .replace("%2", val));
  }
}

function saveSession () {
  post('/save').then(function (data) {
    console.log(JSON.parse(data));
  }).done();
}

function executeCode(f, code) {
  post('/repl', code).then(function (data) {
    console.log(JSON.parse(data));
  }).done();
}


// utilities
function handleStreamingResponse (cb) {
  return function (res) {
    var data = '';
    res.on('data', function (buf) { data += buf; });
    res.on('end',  function ()    { cb(data);    });
  }
}

function post (url, data) {
  var deferred = Q.defer();
  var req = http.request(
    { method: 'POST'
    , path:   url },
    handleStreamingResponse(function (data) {
      deferred.resolve(data);
    }));
  req.end(data || "");
  return deferred.promise;
}

function concurrently (cb) {
  return function runConcurrently (args) {
    return Q.allSettled(args.map(cb));
  }
}
