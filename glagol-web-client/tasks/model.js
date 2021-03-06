(function (root, modules) {

  var model = root().model || {};

  Object.keys(modules.nodes).forEach(function (module) {
    console.info('creating model for module', module);
    var initial = modules.nodes[module]().model;
    Object.keys(initial).forEach(function (key) {
      model[key] = initial[key];
    })
  })

  model = require('riko-mvc').M(model);
  return model;

})
