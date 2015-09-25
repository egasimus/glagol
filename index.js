// export notion-based templating system from ./lib
var e = require('etude-engine');
var p = require('path');
var n = e.tree.makeNotionDirectory(p.join(__dirname, 'lib'));
n.name = require('./package.json').name;
module.exports = e.notion.getTree(n);

// also export blessed library
var blessed = require('blessed');
module.exports.blessed = blessed;
// and its widgets for convenient access
// but only under CamelCased names
Object.keys(blessed.widget)
  .filter(function(k){ return k[0] === k[0].toUpperCase();    })
  .map(   function(k){ module.exports[k] = blessed.widget[k]; });
