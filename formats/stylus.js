module.exports = require('xtend')(require('./plaintext'), { compile: compile });

function compile (file) {
  var _path = file._sourcePath || file.path;
  return require('require-like')(_path)('stylus').render(file.source);
}
