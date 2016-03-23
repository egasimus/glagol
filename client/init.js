(function (root, settings, state) {

  if (root._glagol.type !== 'Directory' && root.parent) root = root.parent;

  var defaults  = { modelName:  'model'
                  , globalName: 'API' }
    , config    = require('extend')(defaults, settings || {})
    , connected = require('q').defer()
    , state     = state ||
                  { root:       root
                  , config:     config
                  , connection: connected.promise };

  Glagol.events.once('changed',
    function (node) {
      console.log("api initializer changed");
      var reset = node();
      reset(root, settings, state) });

  init();

  return state;

  function init () {
    installAPI();
    _.connect(state, connected); }

  function installAPI () {
    var API = state.API = getAPI();
    root._options.globals = function (file) {
      var g = {};
      g[config.globalName] = API;
      return g; }}

  function getAPI () {
    return require('riko-api/client')(
      function () { return state.connection }); }

})
