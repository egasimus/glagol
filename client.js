var h       = require('virtual-dom/h')
  , http    = require('http-browserify')
  , Q       = require('q')
  , util    = require('./util.js')
  , vdom    = require('./lib/vdom.wisp')
  , widgets = require('./widgets.js');

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
    function templateEditorAtom (id) {
      var atom   = state().atoms[id]
        , editor = new widgets.Editor(atom.source.trim())
      return h('.editor-atom',
        [ h('.editor-atom-head',
          [ h('.editor-atom-name', atom.name)
          , h('hr.editor-atom-separator')
          , h('.editor-atom-btn', { onclick: emit('atom-toggle-info', id)     }, 'info')
          , h('.editor-atom-btn', { onclick: emit('atom-execute', id, editor) }, 'run')
          ] )
        , (atom.error && !atom.showInfo)
          ? h('.editor-atom-result.error', atom.error.message)
          : null
        , h('.editor-atom-source', editor)
        , (atom.value && !atom.showInfo)
          ? h('.editor-atom-result', new widgets.JSONViewer(atom.value))
          : null
        , atom.showInfo
          ? h('.editor-atom-info', JSON.stringify(atom, null, 2))
          : null
        ] ); },

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
    function templateSidebarAtom (id) {
      var s        = state()
        , atom     = s.atoms[id]
        , selected = s.selection.indexOf(id) > -1;
      return h('li.sidebar-list-item' + (selected ? '.selected' : ''),
              { onclick: emit(!selected ? 'atom-select' : 'atom-deselect', id) },
              [ atom.name
              , atom.error ? h('label.sidebar-atom-label.error') : null
              , atom.value ? h('label.sidebar-atom-label.ok')    : null ]); },

  toolBar:
    function templateToolBar () {
      return h( '.toolbar',
        [ h( '.toolbar-button', { }, state().mode )
        , h( '.toolbar-button', { onclick: emit('execute-file') }, "execute file" ) ] ); },

};


// view
var view = vdom.init(document.currentScript.parentElement, templates.container);
state(vdom.update.bind(null, view));


// event handlers
events.on('atom-select', function (id) {
  var s = state();
  if (s.selection.indexOf(id) === -1) {
    updateState({ selection: s.selection.concat([id]) });
  }
});

events.on('atom-deselect', function (id) {
  var s = state();
  updateState({ selection: s.selection.filter(function (n) {
    return n !== id;
  })})
});

events.on('atom-toggle-info', function (id) {
  var atom = state().atoms[id];
  atom.showInfo = !atom.showInfo;
  updateState();
})

events.on('atom-execute', function (id, editor) {
  var atoms = state().atoms
    , atom  = atoms[id];
  atom.source = editor.value();
  atom.value = undefined;
  updateState();
  util.post('/run', JSON.stringify({id: id, source: atom.source}))
    .then(function (result) {
      var result = JSON.parse(result)
      events.emit('atom-updated', result);
    }).done();
});

events.on('atom-updated', function (data) {
  var atoms = state().atoms;
  if (!atoms[data.path] || (atoms[data.path].timestamp < data.timestamp)) {
    atoms[data.path] = data;
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
