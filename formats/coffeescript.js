module.exports = require('xtend')(require('./javascript'), { compile: compile });

function compile (file) {
  var _path = file._sourcePath || file.path;
  return require('require-like')(_path)('coffee-script').compile(
    file.source, {});
}
