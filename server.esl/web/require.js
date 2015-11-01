var dependencies = null;

module.exports = function () {
  console.log(deps, require);
  return require;
};

module.exports.install = function (deps, bundle) {
  dependencies = deps;
  document.body.innerHTML = "";
  var script = document.createElement('script');
  script.text = bundle;
  document.body.appendChild(script);
}
