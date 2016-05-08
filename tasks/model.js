(function (root, modules) {

  var model = root.parent().model || {};

  Object.keys(modules.nodes).forEach(function (module) {
    console.info('creating model for module', module);
    var initial = modules.nodes[module]().model;
    Object.keys(initial).forEach(function (key) {
      model[key] = initial[key];
    })
  })

  model = require('riko-mvc').M(model);
  console.log(model, model());
  return model;

})
