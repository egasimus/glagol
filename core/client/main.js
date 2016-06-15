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
  var App = window.App = $.lib.gui.init(Glagol)
    , Workspace = App.Model.Workspace;

  // connect to server-side api
  var socket = require('extend')(
    new WebSocket('ws://localhost:1617'),
    { onopen:    function () { socket.onopen = null; socket.send('api'); }
    , onclose:   function () { window.location.reload(); }
    , onmessage: dispatchUpdate });
  App.API = require('riko-api2')(socket);

  // init plugins
  Object.keys($.modules).forEach(initModule);

  // determine user id
  var id = require('cookie').parse(document.cookie)['user-id'];
  console.info("User ID:", id);
  Workspace.userId.set(id);

  // we're done
  Workspace.Status.set("OK");
  Workspace.StatusBar.set("Ready.");
  return App;

  function initModule (moduleName) {
    var module = $.modules[moduleName];
    try {
      module.init(App);
    } catch (e) {
      console.warn('Could not init module', moduleName, 'because of', e);
    }

    // reload whole page when editing module entry point
    var g = Glagol.get('modules/' + moduleName + '/init.js');
    if (g) g.events.on('changed', function () { window.location.reload() });
  }

  function dispatchUpdate (message) {
    var data   = JSON.parse(message.data)
      , module = data.module
    if (!module) {
      console.warn('Received data from server with no module:', data);
      return;
    }
    var update = $.modules[module].update;
    if (!update || typeof update !== 'function') {
      console.warn('Can\'t update with', data, 'because', module + '.update ' +
        'is not a function.')
      return;
    }
    update(data.data);
  }

})
