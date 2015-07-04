var h    = require('virtual-dom/h')
  , http = require('http-browserify')
  , Q    = require('q')
  , util = require('./util.js')
  , vdom = require('./lib/vdom.wisp');

// state
var state = require('observ')(
  { mode:      'navigate'
  , atoms:     {}
  , selection: [] });
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
  var args1 = [].slice.call(arguments, 1);
  return function (arg) {
    var args2 = args1.concat([].slice.call(arguments, 1));
    events.emit.apply(events, [evt].concat(args2));
  }
}

// real-time messaging
var WebSocket = require('ws')
  , socket    = connectSocket();
function connectSocket () {
  var socket = new WebSocket('ws://localhost:4194/socket');
  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data);
    if (data.event) {
      events.emit(data.event, data.data);
    }
  }
  socket.onclose = emit('disconnected');
  return socket;
}

// templates
var templates = {

  container:
    function templateContainer () {
      var s = state();
      return h('.container',
        [ h('style', require('./editor.styl'))
        , h('style', require('./lib/ldt/ldt.styl'))
        , templates.sidebar()
        , templates.editor() ]); },

  editor:
    function templateEditor () {
      var s = state();
      return h('.editor', (s.selection || []).map(templates.editorAtom)); },

  editorAtom:
    function templateEditorAtom (name) {
      var atom = state().atoms[name];
      return h('.editor-atom',
        [ h('.editor-atom-name',   name)
        , atom.error
          ? h('.editor-atom-result.error', atom.error.message)
          : null
        , h('.editor-atom-source', new (require('./widget.js'))(atom.source.trim()))
        , atom.value
          ? h('.editor-atom-result', JSON.stringify(atom.value, null, 2))
          : null
        , h('.editor-atom-btn',    { onclick: emit('atom-execute', name) }, 'run') ]); },

  sidebar:
    function templateSidebar () {
      var s = state();
      return h('.sidebar',
        [ s.disconnected ? templates.sidebarDisconnected() : null
        , templates.sidebarListAtoms(Object.keys(s.atoms || {})) ]); },

  sidebarDisconnected:
    function templateSidebarDisconnected () {
      return h('.sidebar-disconnected', "disconnected :/") },

  sidebarListAtoms:
    function templateSidebarListLoaded (items) {
      return h('.sidebar-list',
        [ h('.sidebar-list-title' + (items.length === 0 ? '.inactive' : ''), 'loaded atoms')
        , h('ul.sidebar-list-body', items.map(templates.sidebarAtom)) ]); },

  sidebarAtom:
    function templateSidebarAtom (name) {
      var s        = state()
        , atom     = s.atoms[name]
        , selected = s.selection.indexOf(name) > -1;
      return h('li.sidebar-list-item' + (selected ? '.selected' : ''),
              { onclick: emit(!selected ? 'atom-select' : 'atom-deselect', name) },
              [ name
              , atom.error ? h('label.sidebar-atom-label.error') : null
              , atom.value ? h('label.sidebar-atom-label.ok')    : null ]); },

  toolBar:
    function templateToolBar () {
      return h( '.toolbar',
        [ h( '.toolbar-button', { }, state().mode )
        , h( '.toolbar-button', { onclick: emit('execute-file') }, "execute file" ) ] ); },

  form:
    function templateForm (f, i) {
      var s         = state()
        , active    = i == s.files[s.activeFile].activeForm
        , nameFocus = s.mode === 'rename' && active
        , bodyFocus = s.mode === 'edit'   && active;
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
            : new (require('./widget.js'))(f.body, bodyFocus) ]); },

};


// view
var view = vdom.init(document.currentScript.parentElement, templates.container);
state(vdom.update.bind(null, view));


// event handlers
events.on('atom-select', function (name) {
  var s = state();
  if (s.selection.indexOf(name) === -1) {
    updateState({ selection: s.selection.concat([name]) });
  }
});

events.on('atom-deselect', function (name) {
  var s = state();
  updateState({ selection: s.selection.filter(function (n) {
    return n !== name;
  })})
});

events.on('atom-execute', function (name) {
  var atoms = state().atoms
    , atom  = atoms[name];
  atom.value = undefined;
  updateState();
  util.post('/run', name).then(function (result) {
    var result = JSON.parse(result);
    events.emit('atom-updated', result);
  });
});

events.on('atom-updated', function (data) {
  var atoms = state().atoms;
  if (atoms[data.name].timestamp < data.timestamp) {
    atoms[data.name] = data;
    updateState();
  }
})

events.on('disconnected', function (evt) {
  updateState({ disconnected: true })
})


// load data from server
getAtoms().then(function (atoms) { updateState({ atoms: atoms }) });

function getAtoms () {
  return Q.Promise(function (resolve, reject, notify) {
    http.get({ path: '/atoms' }, util.handleStreamingResponse(function (data) {
      var atoms = JSON.parse(data);
      resolve(atoms);
    }));
  });
}


// event handlers

//keymap =
  //{ navigate:
    //{ 13: 'execute-form'  // <Enter>
    //, 65: 'add-atom'      // a
    //, 67: 'call-form'     // c
    //, 68: 'delete-form'   // d
    //, 69: 'edit-form'     // e
    //, 70: 'add-fn'        // f
    //, 72: 'previous-tab'  // h
    //, 74: 'next-form'     // j
    //, 75: 'previous-form' // k
    //, 76: 'next-tab'      // l
    //, 77: 'move-form'     // m
    //, 82: 'rename-form'   // r
    //, 87: 'save-file'     // w
    //}
  //, rename:
    //{ 13: 'end-rename'    // <Enter>
    //, 27: 'exit-mode'     // <Esc>
    //}
  //, edit:
    //{  9: 'insert-tab'    // <Tab>
    //, 27: 'exit-mode' }   // <Esc>
//}

//document.addEventListener('keydown', function (evt) {
  //var active = document.activeElement
    //, mode   = state().mode;
  //if (mode && keymap[mode] && keymap[mode][evt.which]) {
    //evt.preventDefault();
    //events.emit(keymap[mode][evt.which], evt);
  //} else {
    //console.log('keypress', evt.which);
  //}
//});
