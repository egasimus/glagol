module.exports = function (model, template) {

  // https://github.com/Raynos/main-loop
  // needs to be passed the three methods from virtual-dom
  var mainloop = require("main-loop")(model(), render,
    { create: require("virtual-dom/create-element")
    , diff:   require("virtual-dom/diff")
    , patch:  require("virtual-dom/patch") })

  function render (state) { return template(state) }

  // updates DOM when state updates, but not too often
  // which is kind of the whole point of main-loop
  model(function (state) { mainloop.update(state) })

  return mainloop;

}
