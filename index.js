var e = require('etude-engine');
var p = require('path');
var n = e.tree.makeNotionDirectory(p.join(__dirname, 'lib'));
n.name = require('./package.json').name;
module.exports = e.notion.getTree(n);
