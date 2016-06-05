(function (rel, subdir) {

  var glagol  = require('glagol')
    , modules = glagol.Directory('modules');

  require('fs').readdirSync(rel('modules')).forEach(function (moduleName) {
    var modulePath = rel('modules/' + moduleName + '/' + subdir);
    try {
      modules.add(glagol.Link(moduleName, glagol(modulePath)));
    } catch (e) {
      $.log('could not load module', modulePath);
      $.log(e);
    }
  });

  return modules;

})
