// TODO: automatically add modules to Glagol's per-file pseudo-globals,
// instead of using the window object.
//
// The problem here is that modifying options objects is tricky; and
// furthermore does not automatically invalidate evaluation caches.
// These things need to be fixed in Glagol core.

(function (noGlobals) {

  var modules =
    { App: initView()
    , API: initAPI()
    , FS:  initFS() };

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

function initAPI () {
  var _API   = $.lib.api.init(Glagol)
    , socket = _API.socket;
  socket.onclose = function () { window.location.reload() }
  // subscribe to server api
  // TODO replace with new api framework
  _API.API('subscribe', function (data) { _.commands.update(data) })
    .done(function (data) {
      console.debug("subscribed to server");
      _.commands.update(data);
    });
  return _API.API;
}

function initFS () {
  var FSSocket = new WebSocket('ws://localhost:1615')
    , FS       = require('riko-api2')(FSSocket)
  return FS;
}
