(function (state) {

  //console.log("building API", arguments);

  var API = {};

  Object.keys($.modules).forEach(function (moduleName) {
    var module = $.modules[moduleName];
    if (!module || typeof module.api !== 'function') return;
    var moduleApi = module.api(state);
    Object.keys(moduleApi).forEach(function (key) {
      API[moduleName + '/' + key] = moduleApi[key];
    })
  })

  return API;

})
