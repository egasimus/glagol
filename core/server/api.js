(function (state) {

  //console.log("building API", arguments);

  var API = {};

  Object.keys($.modules).forEach(function (moduleName) {
    var module = $.modules[moduleName];
    if (module.API) API[moduleName] = module.API(state);
  })

  return API;

})
