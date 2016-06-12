(function (rel, subdir) {

  var glagol  = require('glagol')
    , modules = glagol.Directory('modules');

  require('fs').readdirSync(rel('modules')).forEach(function (moduleName) {
    $.log('trying to load module', moduleName);
    try {
      var modulePath = rel('modules/' + moduleName + '/' + subdir)
        , module     = glagol(modulePath);
      Object.defineProperty(module, 'name', { value: moduleName }); // rename
      module.reset(); // after rename
      modules.add(module);
    } catch (e) {
      $.log('could not load module', modulePath);
      $.log(e);
    }
  });

  return modules;

})
