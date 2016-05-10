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
  var App = window.App = $.lib.gui.init(Glagol);

  [ 'workspace'
  , 'fs'
  , 'sound' ].forEach(initModule);

  App.Model.Workspace.loading.set(false);
  App.Model.Workspace.bars.bottom.text.set("Ready.");

  return App;

  function initModule (moduleName) {
    App.Model.Workspace.bars.bottom.text.set('initializing ' + moduleName);
    var module = $.modules[moduleName];
    try {
      module.init(App);
    } catch (e) {
      console.warn('Could not init module', moduleName, 'because of', e);
    }
    Glagol.get('modules/' + moduleName).events.on('changed',
      function () { window.location.reload() });
  }

})
