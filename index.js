var e = require('etude-engine');
var n = e.tree.makeNotionDirectory('lib');
n.name = require('./package.json').name;
module.exports = e.notion.getTree(n);
