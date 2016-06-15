// this manages the bundling of the browser code
module.exports = _.lib.bundler.app(
  { formats: { '.styl': require('glagol-stylus')() } },
  rel('core/client'));

// add client-side parts of modules
module.exports.tracked.add($.lib.loadModules(rel, 'client'));

// helper
function rel (p) {
  return require('path').resolve.apply(null,
    [__dirname, '..', '..'].concat(p.split('/')));
}
