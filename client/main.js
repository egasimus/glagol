// TODO: automatically add modules to Glagol's per-file pseudo-globals,
// instead of using the window object.
//
// The problem here is that modifying options objects is tricky; and
// furthermore does not automatically invalidate evaluation caches.
// These things need to be fixed in Glagol core.

(function (embedded) {

  var App = $.lib.gui.init(Glagol)
    , API = initSessionAPI()
    , FS  = initFileAPI();

  if (!embedded) {
    window.App = App;
    window.API = API;
    window.FS  = FS;
    document.head.appendChild(CDNStyleSheet(
      'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.2/css/font-awesome.min.css',
      'sha384-aNUYGqSUL9wG/vP7+cWZ5QOM4gsQou3sBfWRr/8S3R1Lv0rysEmnwsRKMbhiQX/O',
      'anonymous'));
    document.head.appendChild(CDNStyleSheet(
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.css'));
  }

  return App;

  //var modules =
    //{ App:   initView()
    //, API:   initSessionAPI()
    //, FS:    initFileAPI()
    //, Sound: initSoundAPI() };

  //if (!noGlobals) {
    //Object.keys(modules).forEach(function (id) {
      //window[id] = modules[id];
    //})
  //}


})

function initView () {
  // set view engine rolling
  //var App = $.lib.gui.init(Glagol);

  // inject stylesheets from CDN; TODO from node_modules

  //return App;
}

function CDNStyleSheet(href, integrity, crossOrigin) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (integrity) link.integrity = integrity;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  return link;
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
    $.modules.workspace.update(JSON.parse(message.data))
  }
  return sessionAPI;
}

function initFileAPI () {
  var socket  = new WebSocket('ws://localhost:1615')
    , fileAPI = require('riko-api2')(socket)
  socket.onmessage = function (message) {
    //console.debug("FS update", message.data)
    $.modules.fs.update(JSON.parse(message.data));
  }
  return fileAPI;
}

function initSoundAPI () {
  return 
}
