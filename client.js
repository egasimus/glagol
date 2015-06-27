var h    = require('virtual-dom/h')
  , http = require('http-browserify')
  , Q    = require('q')
  , util = require('./util.js')
  , vdom = require('./lib/vdom.wisp');

var x = require('sockets/socket/primus.js');

debugger;

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
        [ h('style', require('./editor.styl')     )
        , h('style', require('./lib/ldt/ldt.styl'))
        , templates.sidebar()
        , templates.editor() ]); },

  editor:
    function templateEditor () {
      var s = state();
      return h('.editor', (s.selection || []).map(templates.editorAtom)); },

  editorAtom:
    function templateEditorAtom (name) {
      return h('.editor-atom', name); },

  sidebar:
    function templateSidebar () {
      var s = state();
      return h('.sidebar',
        [ templates.sidebarListSelected(s.selection || [])
        , templates.sidebarListLoaded(Object.keys(s.atoms || {})) ]); },

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
      return h('li.sidebar-list-item', { onclick: emit('atom-select', name) }, name); },

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
            : new (require('./widget.js'))(f.body, bodyFocus) ]); },

};


// view
var view = vdom.init(document.currentScript.parentElement, templates.container);
state(vdom.update.bind(null, view));


// event handlers
events.on('atom-select', function (atom) {
  updateState({ selection: state().selection.concat([atom]) });
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
