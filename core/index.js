var path = require('path');

module.exports =
  { Script:    require('./script.js')
  , Directory: require('./directory.js')
  , export:    export_ };

function export_ (_module, dir) {
  var rel = path.join.bind(null, path.dirname(_module.id))
    , dir = module.exports.Directory(rel(dir));
  dir.name = require(rel('package.json')).name;
  _module.exports = require('./tree.js')(dir);
  return _module.exports;
}
