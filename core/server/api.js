(function (state, respond) {

  var API = {};

  Object.keys($.modules).forEach(function (moduleName) {
    var module = $.modules[moduleName];
    if (!module || typeof module.api !== 'function') return;
    var moduleApi = module.api(state, respond);
    Object.keys(moduleApi).forEach(function (key) {
      API[moduleName + '/' + key] = moduleApi[key];
    })
  })

  return API;

})
