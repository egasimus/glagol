// TODO: automatically add modules to Glagol's per-file pseudo-globals,
// instead of using the window object.
//
// The problem here is that modifying options objects is tricky; and
// furthermore does not automatically invalidate evaluation caches.
// These things need to be fixed in Glagol core.

(function (noGlobals) {

  var modules =
    { App:   initView()
    , API:   initSessionAPI()
    , FS:    initFileAPI()
    , Sound: initSoundAPI() };

  if (!noGlobals) {
    Object.keys(modules).forEach(function (id) {
      window[id] = modules[id];
    })
  }

  return modules;

})

function initView () {
  var App = $.lib.gui.init(Glagol);
  // inject codemirror stylesheet; TODO from node_modules
  var codemirrorStyle  = document.createElement('link');
  codemirrorStyle.rel  = 'stylesheet';
  codemirrorStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.css';
  document.head.appendChild(codemirrorStyle);
  return App;
}

function initSessionAPI () {
  var socket     = new WebSocket('ws://localhost:1617')
    , sessionAPI = require('riko-api2')(socket);
  socket.onopen = function () {
    socket.onopen = null;
    socket.send('riko');
    sessionAPI('refresh');
  }
  socket.onclose = function () {
    window.location.reload()
  }
  socket.onmessage = function (message) {
    //console.debug("Session update", message.data)
    _.commands.updateSession(JSON.parse(message.data))
  }
  return sessionAPI;
}

function initFileAPI () {
  var socket  = new WebSocket('ws://localhost:1615')
    , fileAPI = require('riko-api2')(socket)
  socket.onmessage = function (message) {
    //console.debug("FS update", message.data)
    _.commands.updateFs(JSON.parse(message.data));
  }
  return fileAPI;
}

function initSoundAPI () {
  return {
    sound:  new AudioContext(),
    chains: {}
  }
}
