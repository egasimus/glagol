(function (state) {

  //console.log("building api", arguments);

  var api = {};

  Object.keys($.modules).forEach(function (moduleName) {
    var module = $.modules[moduleName];
    if (module.api) require('extend')(api, module.api(state));
  })

  return api;

})
