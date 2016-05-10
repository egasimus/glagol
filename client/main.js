(function main () {

  // 1. Add external CSS first for less FOUC
  //
  // TODO inject css from node_modules
  //
  document.head.appendChild($.lib.cdnStylesheet(
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.2/css/font-awesome.min.css',
    'sha384-aNUYGqSUL9wG/vP7+cWZ5QOM4gsQou3sBfWRr/8S3R1Lv0rysEmnwsRKMbhiQX/O',
    'anonymous'));
  document.head.appendChild($.lib.cdnStylesheet(
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.css'));

  // 2. Launch modules
  //
  // TODO: automatically add modules to Glagol's per-file evaluation contexts,
  // instead of using 'hard' globals a.k.a. the window object.
  // The problem here is that modifying options objects is tricky; and
  // furthermore does not automatically invalidate evaluation caches.
  // These things need to be fixed in Glagol core.
  //
  window.App = $.lib.gui.init(Glagol);
  window.API = initSessionAPI();
  window.FS  = initFileAPI();

  return App;

})

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
