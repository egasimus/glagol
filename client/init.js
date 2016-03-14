(function (root, settings) {

  if (root._glagol.type !== 'Directory' && root.parent) root = root.parent;

  var defaults = { modelName: 'model', globalName: 'API' }
    , config   = require('extend')(defaults, settings || {})
    , state    = { root: root, config: config };

  Glagol.parent.events.on('changed', init);
  init();

  return state;

  function init () {
    installAPI();
    _.connect(state); }

  function installAPI () {
    root._options.globals = require('extend')(
      root._options.globals, { API: getAPI() }) }

  function getAPI () {
    return require('riko-api/client')(
      function () { return state.connection }); }

})
