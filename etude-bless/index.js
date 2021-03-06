// export notion-based templating system from ./lib
require('etude-engine').export(module, 'lib');

// also export blessed library
var blessed = require('blessed');
module.exports.blessed = blessed;
// and its widgets for convenient access
// but only under CamelCased names
Object.keys(blessed.widget)
  .filter(function(k){ return k[0] === k[0].toUpperCase();    })
  .map(   function(k){ module.exports[k] = blessed.widget[k]; });
