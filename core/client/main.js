Glagol.events.once('changed', _.reload(__filename));

module.exports = function main () {

  var App = {};

  App.addStyleSheet = function () {
    console.debug.apply(console, ['Adding stylesheet:'].concat(arguments));
    document.head.appendChild($.lib.cdnStylesheet.apply(null, arguments));
  }

  _.moduleOrder.forEach(initModule);

  function initModule (name) {
    var entryPoint = Glagol.get('modules/' + name + '/init.js');
    if (entryPoint && entryPoint()) {
      console.debug('running', name + '/init');
      entryPoint.events.on('changed', _.reload(name + ' entry point'));
      entryPoint()(App);
    }
  }

  //// we're done
  //Workspace.Status.set("OK");
  //Workspace.StatusBar.set("Ready.");
  //return App;

  //function initModule (moduleName) {
    //var module = Glagol.get('modules').get(moduleName);
    //try {
      //module().init(App);
    //} catch (e) {
      //console.warn('Could not init module', moduleName, 'because of', e);
      //console.log(e.stack);
    //}

    //// add module css
    //var stylesheet = module.get('style.styl')
      //, styleElement;
    //if (stylesheet) {
      //styleElement = $.lib.gui.util.insertCss(stylesheet());
      //styleElement.dataset['module'] = moduleName;
      //stylesheet.events.on('changed',
        //function () {
          //styleElement.parentElement.removeChild(styleElement);
          //styleElement = $.lib.gui.util.insertCss(stylesheet());
          //styleElement.dataset['module'] = moduleName;
        //})
    //}

    //// reload whole page when editing module entry point
    //var g = Glagol.get('modules/' + moduleName + '/init.js');
    //if (g) g.events.on('changed', function () { window.location.reload() });
  //}


}
