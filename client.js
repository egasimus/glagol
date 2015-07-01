var h    = require('virtual-dom/h')
  , http = require('http-browserify')
  , Q    = require('q')
  , util = require('./util.js')
  , vdom = require('./lib/vdom.wisp');

var WebSocket = require('ws')
  , ws        = new WebSocket('ws://localhost:4194/socket');

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
      console.log(atom);
      return h('.editor-atom',
        [ h('.editor-atom-name',   name)
        , atom.error ? h('.editor-atom-result.error', atom.error.message)         : null
        , atom.value ? h('.editor-atom-result',       JSON.stringify(atom.value)) : null
        , h('.editor-atom-source', new (require('./widget.js'))(atom.source.trim()))
        , h('.editor-atom-btn',    { onclick: emit('atom-execute', name) }, 'run') ]); },

  editorAtomError:
    function templateEditorAtomError (error) {
      return h('.editor-atom-result.error', error.message);
    },

  sidebar:
    function templateSidebar () {
      var s = state();
      return h('.sidebar',
        [ templates.sidebarListLoaded(Object.keys(s.atoms || {})) ]); },

  sidebarListSelected:
    function templateSidebarListSelected (items) {
      return h('.sidebar-list',
        [ h('.sidebar-list-title' + (items.length === 0 ? '.inactive' : ''), 'selected atoms')
        , h('ul.sidebar-list-body', items.map(templates.sidebarListItemSelected)) ]); },

  sidebarListItemSelected:
    function templateSidebarListItemSelected (name) {
      return h('li.sidebar-list-item', { onclick: emit('atom-goto', name) }, name); },

  sidebarListLoaded:
    function templateSidebarListLoaded (items) {
      return h('.sidebar-list',
        [ h('.sidebar-list-title' + (items.length === 0 ? '.inactive' : ''), 'loaded atoms')
        , h('ul.sidebar-list-body', items.map(templates.sidebarListItemLoaded)) ]); },

  sidebarListItemLoaded:
    function templateSidebarListItemLoaded (name) {
      var s        = state()
        , selected = s.selection.indexOf(name) > -1;
      return h('li.sidebar-list-item' + (selected ? '.selected' : ''),
              { onclick: emit(!selected ? 'atom-select' : 'atom-deselect', name) },
              name); },

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
  util.post('/run', name).then(function (result) {
    var result = JSON.parse(result);
    var atoms = state().atoms
      , atom  = atoms[name];
    atom.error = result.error ? result : null;
    atom.value = result.error ? null : result.value;
    updateState(); // TODO assoc :(
  });
});


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
