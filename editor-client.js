var h    = require('virtual-dom/h')
  , http = require('http-browserify')
  , Q    = require('q')
  , util = require('./util.js')
  , vdom = require('./lib/vdom.wisp');


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
function getActiveForm (snapshot) {
  var file  = snapshot.files[snapshot.activeFile]
    , index = file.activeForm
    , form  = file.forms[index];
  return form;
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

  container:
    function templateContainer () {
      var s = state();
      return h('.container',
        [ h('style', require('./editor.styl')     )
        , h('style', require('./lib/ldt/ldt.styl'))
        , templates.editor()
        , templates.toolBar()
        , templates.tabBar() ]);
    },

  editor:
    function templateEditor () {
      var s = state();
      return h('.editor',
        (s.files ? (s.files[s.activeFile].forms || []) : []).map(templates.form));
    },

  tabBar:
    function templateBar () {
      return h( '.tab-bar',
        Object.keys(state().files || {}).map(function(file, i) {
          var el = templates.tab(file, i);
          return el; }) );
    },

  tab:
    function templateBarFile (filename, i) {
      return h(
        '.tab-bar-file' + (state().activeFile === filename ? '.active' : ''),
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
        [ h('label.type', f.type)
        , h('input.name' + (nameFocus ? '.focus-me' : ''),
            { placeholder: 'enter name...'
            , onblur:      emit('name-blurred', f)
            , onfocus:     emit('rename-form')
            , value:       f.name || ''})
        , f.type === 'use'
            ? undefined
            : new (require('./editor-widget.js'))(f.body, bodyFocus) ]);
    },

};


// view
var view = vdom.init(document.currentScript.parentElement, templates.container);
state(vdom.update.bind(null, view));

// load data from server
getFiles().then(util.concurrently(getForms)).done();

function getFiles () {
  var deferred = Q.defer();
  http.get({ path: '/files' }, util.handleStreamingResponse(function (data) {
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
  http.get({ path: '/forms?file=' + filename }, util.handleStreamingResponse(function (data) {
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
  util.post('/save?file=' + s.activeFile, source).then(function (response) {
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

events.on("execute-form", function () {
  var s = state()
    , f = getActiveForm(s);
  util.post('/update?file=' + s.activeFile, JSON.stringify(f)).then(function (data) {
    console.log(JSON.parse(data));
  }).done();
});

events.on("exit-mode", function () {
  var s = state()
    , f = getActiveForm(s);
  if (s.mode === 'edit') {
    f.body = document.activeElement.value;
  }
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
  var f = getActiveForm(state());
  f.name = document.activeElement.value;
  if (f.isNew) {
    document.activeElement.blur();
    delete f.isNew;
    events.emit("edit-form");
  } else {
    events.emit("exit-mode");
  }
});

events.on("execute-file", function () {
  util.post('/run').then(function (data) {
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
  util.post('/save').then(function (data) {
    console.log(JSON.parse(data));
  }).done();
}

function executeCode(f, code) {
  util.post('/repl', code).then(function (data) {
    console.log(JSON.parse(data));
  }).done();
}
